// const { parseFlagList } = require("mysql/lib/ConnectionConfig");

let LONGTERMS = [1, 7, 6]
let start = Date.now()
document.addEventListener('DOMContentLoaded', main, false);

// A quick little namespace object so that dat2func doesn't have to work too hard.
let nameToFunc = {startSurvey: startSurvey,
             EMWordStim: EMWordStim,
             EMObjectPicture: EMObjectPicture,
             EFRuleID: EFRuleID,
             SMObjectNaming: SMObjectNaming,
             WMForwardDigitSpan: WMForwardDigitSpan,
             WMBackwardDigitSpan: WMBackwardDigitSpan,
             EFStroop: EFStroop,
             PSStringComparison: PSStringComparison,
             endSurvey: endSurvey};

let pressAny = '<p style="font-size:32px">Press any key to continue...<p>'
// Standard shuffle function
function fisherYates(tarArray){
    let array = JSON.parse(JSON.stringify(tarArray));
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}
// standard sleep function
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

function endTimer() {
    // This is to send data to the stopwatch php script that sends whole-times to the database.
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../stopwatch.php');
    xhr.setRequestHeader('Content-Type', 'application/json');

    let packet = {
        time: Date.now() - start,
        pid: pid
    }

    xhr.send(JSON.stringify(packet))
}

function runPythonScript() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../run_python_script.php', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        console.log('Python script executed successfully');
        // Additional code to handle the response if needed
      } else {
        console.error('Error executing Python script');
      }
    };
    xhr.send();
  }
  

function getParams(func) {
    /**
     * Helper function stolen from geeksforgeeks.
     * https://www.geeksforgeeks.org/how-to-get-the-javascript-function-parameter-names-values-dynamically/
     * @type {string}
     */

    // String representaation of the function code
    var str = func.toString();

    // Remove comments of the form /* ... */
    // Removing comments of the form //
    // Remove body of the function { ... }
    // removing '=>' if func is arrow function
    str = str.replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/(.)*/g, '')
        .replace(/{[\s\S]*}/, '')
        .replace(/=>/g, '')
        .trim();

    // Start parameter names after first '('
    var start = str.indexOf("(") + 1;

    // End parameter names is just before last ')'
    var end = str.length - 1;

    var result = str.substring(start, end).split(", ");

    var params = [];

    result.forEach(element => {

        // Removing any default value
        element = element.replace(/=[\s\S]*/g, '').trim();

        if(element.length > 0)
            params.push(element);
    });

    return params;
}

// two little wrappers for getData to make our lives easier.
async function loadQuestions() {
    return getData('questions/json/qblock.json')
}

async function getPics(){
    return getData('src/preload.json')
}

function dat2Func(dat){
    /**
     * A function that takes in the generalized question data object (defined in qblock.json) and does a smart-conversion
     * into a jsPsych trial object.
     */

    let data = {stims_type: dat['stimsType'], item: dat['taskNum'], difficulty: dat['difficulty']};

    let tarfunc = nameToFunc[dat['kind']];
    let params = getParams(tarfunc);
    if (params.includes('choices')){
        return tarfunc(dat['stimuli'], dat['trials'], data);
    } else if (params.includes('delay')) {
        let dparam = parseInt(dat['stimsType'].slice(0, -1));
        return tarfunc(dat['stimuli'], dparam * 1000, data); // We have to convert seconds to ms
    } else if (params.includes('question')){
        return tarfunc(dat['stimuli'][0])
    } else {
        return tarfunc(dat['trials'], data);
    }


}

function itemsByDifficulty(qBlock, difficulty){
    /**
     * Looks at qblock and pulls out just the questions with difficulty = to `difficulty`
     */
    return Object.keys(qBlock).filter((key) => qBlock[key]['difficulty'] === difficulty);
}


async function easyBlock(qBlock){
    /**
     * Defines the easy questions. Basically each of these three blocks are identical except for difficulty.
     * I wouldn't say this is a _good_ solution to the problem that jspsych expects one init per experiment,
     * but it's the best one I could think of.
     */
    let block = {};
    let timeline = [];

    timeline.push({
        type: 'html-keyboard-response',
        stimulus: "Great job! Now we will begin the real study. You will take many of the tasks in random order.  Please do all the work in your head (don't use paper to help).",
        prompt: pressAny
    });

    timeline.push({
        type: 'html-keyboard-response',
        stimulus: "It is important that you take your time for each answer (it is designed to get difficult).  Only one of the tasks requires you to respond quickly, and we will remind you for that task.",
        prompt: pressAny
    });

    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 1 of 3',
        prompt: pressAny
    });

    let tarNums = itemsByDifficulty(qBlock, 'easy');
    let orderedNums = fisherYates(tarNums);
    let allpics = await getPics()['easy'];
    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
    }
    // Oh the humanity why.

    // Basically this is putting the on_finish marker on the absolute last jsPsych task. Because for some reason
    // jsPsych is set up so that if you apply on_finish to a timeline, it runs it on finishing EVERY SUBTASK WHYYYYYYYY
    let litem = await timeline[timeline.length - 1]
    let ltask = await litem['timeline'][litem['timeline'].length - 1]
    ltask['on_finish'] = async function (data) {
        validateData();
        jsPsych.init(await medBlock(qBlock))
    }
    block['preload_images'] = allpics
    block['timeline'] = timeline;
    return block;
}



async function medBlock(qBlock){
    let block = {};
    let timeline = [];

    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 2 of 3',
        prompt: pressAny
    });
    let tarNums = itemsByDifficulty(qBlock, 'medium');
    let orderedNums = fisherYates(tarNums);
    let allpics = await getPics()['medium'];

    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
    }

    // I'm sure this is the right design decision on jsPsych's part, considering that very very few of us do adaptive
    // testing research and even fewer of us do it online.

    let litem = await timeline[timeline.length - 1]
    let ltask = await litem['timeline'][litem['timeline'].length - 1]
    ltask['on_finish'] = async function (data) {
        validateData();
        jsPsych.init(await hardBlock(qBlock))
    }
    block['timeline'] = timeline;
    block['preload_images'] = allpics;

    return block
}

async function TESTBLOCK(qBlock) {
    // This is a special block I use to test stuff, it isn't connected to the others using the
    // on_finish chaining technique.
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'If you see this message, tell Coen he screwed up.',
        prompt: pressAny
    });
    let testcases = ['833'];
    for (let i of testcases) {
        timeline.push(await dat2Func(qBlock[i]));
    }

    block['timeline'] = timeline;
    return block
}

async function practiceBlock(qBlock){
    /**
     * This one defines the practice block, note that it has some extra logic for defining the instructions.
     */
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'First, some practice.',
        prompt: pressAny
    })
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'For some of these tasks you will need to use the mouse, for others you will use the keyboard.',
        prompt: pressAny
    })
    let tarNums = itemsByDifficulty(qBlock, 'practice');
    let instructions = await getData('./src/instructions.json')
    const response = await fetch('./src/instructions.json');
    console.log(response);
    for (const i in tarNums){
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: instructions[qBlock[tarNums[i]]['kind']],
            prompt: pressAny
        })
        timeline.push(await dat2Func(qBlock[tarNums[i]]));
        timeline.push({
            type: 'html-keyboard-response',
            stimulus: instructions[qBlock[tarNums[i]]['kind']+'FB'],
            prompt: pressAny
        })
    }

    // If you want the test to stop after the practice round, get rid of this timeline push.

    timeline.push({type: 'html-button-response',
        stimulus: 'Would you like to repeat the practice round?',
        choices: ['yes', 'no'],
        on_finish: async function (data) {
            validateData();
            if (data['button_pressed'] === '1') {
                jsPsych.init(await easyBlock(qBlock))
            } else {
                jsPsych.init(await practiceBlock(qBlock))
            }
        }
    })

    block['timeline'] = timeline;
    return block}


async function hardBlock(qBlock){
    let block = {};
    let timeline = [];

    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Block 3 of 3',
        prompt: pressAny
    })
    let tarNums = itemsByDifficulty(qBlock, 'hard');
    let orderedNums = fisherYates(tarNums);
    let allpics = await getPics()['hard'];

    for (const i in orderedNums){
        timeline.push(await dat2Func(qBlock[orderedNums[i]]));
    }
    let litem = await timeline[timeline.length - 1]
    let ltask = await litem['timeline'][litem['timeline'].length - 1]
    ltask['on_finish'] = async function (data) {
        validateData();
        jsPsych.init(await endBlock(qBlock))
    }
    block['preload_images'] = allpics;
    block['timeline'] = timeline;

    return block
}

async function endBlock(qBlock){
    /**
     * Similar to the practice block, the end block just does the survey and the long term memory questions.
     */
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: "You're almost done! Just a few more items to test your longer term memory, and then a short survey",
        prompt: pressAny
    })
    for(let i in LONGTERMS){
        let dat = qBlock[LONGTERMS[i].toString()]
        let data = {stims_type: dat['stimsType'], item: 'LO' + dat['taskNum'], difficulty: dat['difficulty']};
        timeline.push(EMLongTerm(dat['stimuli'], dat['trials'], data))
    }
    let surveyQs = itemsByDifficulty(qBlock, 'survey')
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: "For each of the following abilities, please rate yourself compared to an <b> average person </b> your age with normal cognitive abilities.",
        prompt: pressAny
    })
    let rSurveyQs = fisherYates(surveyQs)
    for (const i in rSurveyQs){
        let dat = qBlock[rSurveyQs[i]]
        timeline.push(endSurvey(dat['stimuli'], {item: dat['taskNum']}))
    }

    timeline.push({type: 'call-function',
        func: endTimer})
    timeline.push({type: 'call-function',
        func: runPythonScript})
    
    timeline.push({type: 'html-button-response',
    stimulus: "Thanks for taking the time to do this experiment!",
    choices: ['Press here to complete the experiment.'],
    on_finish: function(data){window.location.replace('https://app.prolific.co/submissions/complete?cc=7BA58854')}
    })
    block['timeline'] = timeline;
    return block
}

async function startBlock(qBlock){
    /**
     * Similar to the practice block, the end block just does the survey and the long term memory questions.
     */
    let block = {};
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: "Before we begin the experiment, please fill out this short survey!",
        prompt: pressAny
    })
    let surveyQs = itemsByDifficulty(qBlock, 'surveyB')
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: "For each of the following abilities, please rate yourself compared to an <b> average person </b> your age with normal cognitive abilities.",
        prompt: pressAny
    })
    let rSurveyQs = fisherYates(surveyQs)
    for (const i in rSurveyQs){
        let dat = qBlock[rSurveyQs[i]]
        timeline.push(endSurvey(dat['stimuli'], {item: dat['taskNum']}))
    }

    timeline.push({type: 'call-function',
        func: endTimer})

    // end?
    timeline.push({type: 'html-keyboard-response',
        stimulus: 'Thank you! Continue to experiment.',
        prompt: pressAny
    })
    // block['timeline'] = timeline;
    // return block

    // new end
    console.log(timeline)
    let litem = await timeline[timeline.length - 1]
    let ltask = await litem['timeline'][litem['timeline'].length - 1]
    ltask['on_finish'] = async function (data) {
        validateData();
        jsPsych.init(await practiceBlock(qBlock))
    }
    block['timeline'] = timeline;
    block['preload_images'] = allpics;

    return block
}
// The function will help to determine the next question after a question is answered and
//  I feel start block should present the 1st question.
async function determineNextQuestion() {
    return
}





async function main() {
    let timeline = [];
    timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'Welcome to the Experiment!',
        prompt: pressAny
    })


    timeline.push({
        type: 'fullscreen',
        fullscreen_mode: true
    })

    let qBlock = await loadQuestions();


    timeline.push(await practiceBlock(qBlock));
    // timeline.push(await startBlock(qBlock));
    // timeline.push(await hardBlock(qBlock));
    // timeline.push(await endBlock(qBlock));


    jsPsych.init({timeline: timeline});
}
