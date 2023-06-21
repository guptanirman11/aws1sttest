jsPsych.plugins["html-buttons-for-duration"] = (function() {

    var plugin = {};

    plugin.info = {
        name: "html-buttons-for-duration",
        parameters: {
            question_set: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'default_q',
                array: true
            },
            answer_set: {
                type: jsPsych.plugins.parameterType.STRING,
                array: true,
                default: 'default_a'
            },
            duration: {
                type: jsPsych.plugins.parameterType.INT,
                default: 12000
            },
            randomize_order: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: false
            },
            button_html: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button HTML',
                default: '<button class="jspsych-btn">%choice%</button>',
                array: true,
                description: 'The html of the button. Can create own style.'
            },
            answer_delay: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Answer Delay",
                default: 250,
                description: "Amount of time to wait before displaying the buttons."
            },
            feedback_delay: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Feedback Delay",
                default: 500
            },
            feedback_display_time: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Feedback Display Time",
                default: 1000
            }
        }
    }
    // This whole thing is for the distractor problems, it gets a big long list of math problems then runs through them until you're done.
    plugin.trial = function(display_element, trial) {

        var response = {
            rt: [],
            button: [],
            answer: []
        }
        
        let choices = [...new Set(trial.answer_set)]
            
        function entangledFisherYates(arr1, arr2){
            let index = arr1.length;
            let rnd, tmp1, tmp2;
            while (index){
                rnd = Math.floor(Math.random() * index);
                index -= 1;
                tmp1 = arr1[index];
                tmp2 = arr2[index];
                arr1[index] = arr1[rnd];
                arr2[index] = arr2[rnd];
                arr1[rnd] = tmp1;
                arr2[rnd] = tmp2;
            }
            // Basically we're doing a fisher-yates shuffle (pick a random number and switch the
            // Nth from last object with it N times) except we apply the same shuffle to both lists.
        }
        let html = ''
        let trialIndex = 0

        let questions = JSON.parse(JSON.stringify(trial.question_set))
        let answers = JSON.parse(JSON.stringify(trial.answer_set))

        let startTime = Date.now()
        if (trial.randomize_order) {
            entangledFisherYates(questions, answers)
        }

        function after_response(choice) {
            let endTime = Date.now();
            let rt = endTime - startTime;
            response.button.push(choices[choice]);
            response.rt.push(rt);
            response.answer.push(answers[trialIndex])
            html = html.match(/<div .+>.*<\/div><!--it me-->/)[0]
            display_element.innerHTML = html + '<div>&nbsp;</div>'

            function showFeedback() {
                // These are the little things that show you if you were right or not. I have the delays set up in a way so that you can't just speed through these problems
                // but also there isn't a frustration element with what feels like low reaction times.

                display_element.innerHTML = html
                if(choices[choice] === answers[trialIndex]) {
                    display_element.innerHTML += '<div style="color: #33673B">' + 'Correct' + '</div>'
                } else {
                    display_element.innerHTML += '<div style="color: #F93943">' + 'Incorrect' + '</div>'
                }

                function nextTurn() {
                    if (rt < trial.duration) {
                        trialIndex += 1;
                        doSingleTrial(questions[trialIndex])
                    } else {
                        endTrial()
                    }
                }

                window.setTimeout(nextTurn, trial.feedback_display_time)
            }
            window.setTimeout(showFeedback, trial.feedback_delay)
        }

        function doSingleTrial(question){
            // display stimulus
            // I inserted a little comment tag so that we can easily extract this tag later.
            html = '<div id="jspsych-html-buttons-for-duration-stimulus">'+question+'</div><!--it me-->';

            display_element.innerHTML = html + '<div> &nbsp; </div>';


            function displayButtons(){
                //display buttons
                var buttons = [];
                if (Array.isArray(trial.button_html)) {
                    if (trial.button_html.length === choices.length) {
                        buttons = trial.button_html;
                    } else {
                        console.error('Error in html-button-response plugin. The length of the button_html array does not equal the length of the choices array');
                    }
                } else {
                    for (let i = 0; i < choices.length; i++) {
                        buttons.push(trial.button_html);
                    }
                }
                html += '<div id="jspsych-html-buttons-for-duration-btngroup" class="container object">';
                for (let i = 0; i < choices.length; i++) {
                    var str = buttons[i].replace(/%choice%/g, choices[i]);
                    html += '<div class="jspsych-html-buttons-for-duration-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-html-buttons-for-duration-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
                }
                html += '</div>';

                display_element.innerHTML = html;

                // add event listeners to buttons
                for (var i = 0; i < choices.length; i++) {
                    display_element.querySelector('#jspsych-html-buttons-for-duration-button-' + i).addEventListener('click', function(e){
                        // noinspection JSUnresolvedFunction
                        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
                        after_response(choice);
                    });

                }
            }
            window.setTimeout(displayButtons, trial.answer_delay)

        }


        function endTrial(){
            var trial_data = {
                "rt": Math.round(response.rt),
                "stimulus": trial.stimulus,
                "button_pressed": response.button
            };
            display_element.innerHTML = '';
            jsPsych.finishTrial(trial_data)
        }

        doSingleTrial(questions[trialIndex])
    };

    return plugin;
})();
