# R56 Web test

R56 is the project to collect pilot data for a Computerized Adaptive Test for Cognition (CAT-COG). This is the Javascript version of it for use in web browsers.

[Current Location](https://uchicago.co1.qualtrics.com/jfe/form/SV_bd7jEAFxEnKiqUd)

# Stuff for Users

R56 will have 9 tasks programmed into it, meant to probe 5 domains of cognitive function. The tasks are all designed to have variable difficulty, and to confound one another as little as possible.

| Task Name | Domain | Code |
|-----------|--------|---|
|Word Stimuli|Episodic Memory| EMRG |
|Object-Picture|Episodic Memory| EMRG |
|Nonsense Words|Episodic Memory| EMRG |
|Object Naming| Semantic Memory| SMON |
|Forward Digit Span|Working Memory| WMFS |
|Backward Digit Span|Working Memory| WMBS |
|Stroop|Executive Function| EFST |
|Rule Identification| Executive Function| EFRI |
|String Comparison| Processing Speed| PSSC |

## Episodic Memory

Episodic Memory describes a person's ability to recall a specific event. Generally it is probed by exposing a test subject to a number of stimuli, the exposure creating an event in the subject's memory. Then the subject is asked to recall information from the stimuli.

All of the episodic memory tasks are given as html button tasks. In other words, they are shown a set of stimuli, and then given a set of html buttons to click in order to choose their response. Each question is set by the design documents, but each set of choices has their positions randomized. 

The stimuli block and the question block are separated by distractor questions. These questions are true-false math problems, answered with an html button press. The subject is shown a simple, addition based, equation, and asked if that equation is true or not. For example:
$$
10 + 4 = 15\\
\text{True} \:\:\:\:\:\:\:\:\:\:\:\:\:\:\:\:\:\:\:\:\:\:\: \text{False}
$$
Here the correct answer is "False". After a short delay, the subject is shown feedback telling them if they got the distractor question correct or incorrect. The distractors are shown for 12 seconds, with a 3 second screen at the beginning telling the subject that they are about to be shown the distractor questions. After the 12 seconds is up, the subject finishes up their current question, and then is given multiple choice questions asking which of the choices were shown in the stimulus phase.

### Word Stimuli 

The subject is exposed to a set of English words. During the choices phase, they are given a set of words, and asked words were in the original stimuli. None of the words, even incorrect answers, may overlap with the Semantic Memory Object Naming item. Harder items give the subject words that are semantically similar to stimulus words. Word stimuli items are divided into two types, those that use unrelated terms in the stimulus set, and those that use related terms.


### Object-Picture

The stimulus phase consists of flashing a number of images on the screen in a set order. During the choices phase, the subject is given four images, one of which was in the stimulus. The subject is asked to report which of the images was in the stimulus. Difficult items render the same type of object, with token differences. (A cream colored bike might be shown, and choices may be between four bikes of different colors.) Object-Picture items are classified by 

### Nonsense Words

The stimulus phase for Nonsense Words tasks consists of a set of english-sounding, but meaningless words. The choices phase is a set of nonsense words. Harder items render the choices as words that are phonetically close to the stimuli.

## Semantic Memory

In the R56, there is one semantic memory task, Object Naming. 

### Object Naming

For each trial, the subject is shown an image, and four html buttons containing nouns. The subject should choose the noun that best describes the image. For each trial in the item, the choices do not change, but their positions are scrambled after each answer. Harder items show nouns that fill the same kind. For example, one such item depicts a seagull, and gives the choices: pidgeon, seagull, cardinal, duck.

## Working Memory

In the R56, there are two working memory tasks. The subject is shown a sequence, and asked to enter the sequence in after a short delay using the keyboard. The delay, and sequence length is varied.

### Forward Digit Span

The subject is shown a series of numerals for one second each, with 1 second of blank screen in between each of them. The instruction: "Rehearse the digits in forward order (first to last)" is shown throughout, and for a varying amount of time afterwards. (Mostly 1 second, but one item does this for 5).

After this, the subject is asked to enter the sequence of numerals using their keyboard, pressing enter when done. Use of the backspace key and a numeric keypad have been implemented. 

### Backward Digit Span

The subject is shown a sequence of numerals for one second each, with one second of blank screen in between each of them. The instruction "Rehearse the digits in backward
order (last to first)." is shown throughout, and for one second afterwards.

After this, the subject is asked to enter the sequence of numerals in reverse order using their keyboard, pressing enter when done. This uses the same interface as the forward digit span.

## Executive Function

There are two executive function tasks. They both have to do with visually identifying color and content, and synthesizing this data in an abnormal way. These tasks use a custom pallette.
<center>

|English|Hex Value|Visual|
|-------|---------|------|
|Red|#F94D56|<div style="background-color:#F94D56">&nbsp;</div>|
|Green|#33673B|<div style="background-color:#33673B">&nbsp;</div>|
|Blue|#0B4F6C|<div style="background-color:#0B4F6C">&nbsp;</div>|
|Orange|#E05200|<div style="background-color:#E05200">&nbsp;</div>|
|Yellow|#FDE74C|<div style="background-color:#FDE74C">&nbsp;</div>|
|Purple|#662C91|<div style="background-color:#662C91">&nbsp;</div>|
|White|#F4F1DE|<div style="background-color:#F4F1DE">&nbsp;</div>|
|Black|#000000|<div style="background-color:#000000">&nbsp;</div>|

</center>

 White is used only for the numbers printed on the shapes in the Rule ID task. In all other places in the R56, #FFFFFF (True White) is used for white. Internal design documents use the first letter of each color word to denote the use of that color, except for black, which is denoted as "K".

### Stroop

This is an implementation of the classic Stroop task. The subject is shown an instruction screen explaining the task, with an example. They are then shown a set of color words, rendered in varying colors, these will be Blue, Yellow, Purple, Red, Green, or Black. This screen is shown for a varying time. The subject is then asked to enter, using the keyboard, the number of words which matched the color they were printed in. For example:

<center>
<p style='color:#FDE74C'>Yellow<p>
<p style='color:#F93943'>Green<p>
<p style='color:#33673B'>Red<p>
</center>

The answer for this example is 1.


These should be coded in the format "Color.X", where "Color" is the _word_ you want to appear, and "X" is the letter code for the _ink color_. For example the above is coded as "Yellow.Y, Green.R, Red.G".

### Rule Identification


![](RuleIDEx.png)

The subject is shown a series of colored shapes with numbers overlaid.
They are asked to report "Shape", "Color", or "Number" depending on which feature is the _most common_ among the figures. 
In the above example, there are two diamonds, all different numbers, and three green shapes. Thus, the answer is "Color".
In the control documents, each shape is described by a three character code.
Each trial is described by a list of these codes.

<center>

|Code |Meaning |Representation|
|:---:|:------:|:------------:|
|  H  |Hexagon |      ⬢       |
|  D  |Diamond |      ♦       |
|  S  |Square  |      ■       |
|  C  |Circle  |      ●       |
|  T  |Triangle|      ▲       |
|     |        |              |
|  R  |  Red   |<div style="background-color:#F94D56">&nbsp;</div>|
|  G  |  Green |<div style="background-color:#33673B">&nbsp;</div>|
|  O  |  Orange|<div style="background-color:#E05200">&nbsp;</div>|
|  B  |  Blue  |<div style="background-color:#0B4F6C">&nbsp;</div>|
|  P  |  Purple|<div style="background-color:#662C91">&nbsp;</div>|

</center>

So the above example would be described by:
```
DG5, DG4, SG3
```

In the CSV file `RuleID.csv`.

## Processing Speed

### String Comparison

The subject is shown a sequence of pairs of strings. One is displayed on the left of the screen, and the other is displayed on on the right side. The subject is asked to press "Q" if the two strings are the same, and "P" if they are different. 

This task is timed in a different way than others. Where all other items are timed separately, the processing speed task is timed cumulatively.
This is because unlike the other items, the processing speed task quits automatically if the time limit (5 seconds for most tasks, and 6 seconds for the easy tasks,) is reached in total.
In other words, if a subject takes one second to do the first trial, then they will have four seconds to do the remaining two.

## Usage Notes

There are two types of additions that someone can make to this experiment. 

### Adding New Items

The items that show up in the experiment are all configured in a JSON file at `./questions/json/qblock.json`. This shouldn't be adjusted manually. Instead, you should add items in the appropriate CSV file in `./questions/csv/`. Then, when you're ready, save that `csv` file, and on the command line run:

```shell
python ./questions/update.py
```
or 
```shell
python3 ./questions/update.py
```
on MacOSX.

There is another python script, `distractor_problems.py` in the `questions` folder which generates `./questions/json/distractors.json` configuration. This is a list of distractor problems for the episodic memory tasks. If you want to change the way these work, feel free to adjust the code there. My recommendation is that this should only use basic python libraries so that nobody has to install any new python packages in order to run it. This rule also applies to the `update.py` script.

Guidelines: Generally, enter new items in the same format as they appear elsewhere in the file. 
Some items have a "StimsType" parameter which needs to be filled out.
Most often, this controls how the stimulus behaves.
The "difficulty" parameter tells the program which programming block to add your item to.

If you are adding a new episodic memory items and you'd like it to also appear in the long term memory task at the end of the task, add its item

### Adding New Types of Items

If you want to add an entirely new item to the task, you will need to do some javascript programming. First, create a new `csv` file in `./questions/csv` for the new item. Name it with the object name that you intend to use in the code. Run `update.py` as above. This will add your new item to the question block. Then you need to write javascript code that will generate the task as a JSPsych task.

# Stuff for Programmers:

The system is built to be as general as possible at the high level. There are three levels at which the task runs. All of the new code is in the `src/` folder. 
There is the engine level, in `engine.js`, the task level which is in `task.js`, and the plugin level, which is in all of the javascript files that start with `jspsych`. 
Plugins that are not included in the JSPsych framework and made bespoke should be stored in the `src` folder as well. 
Plugins are all loaded in the `index.html`. 
This is the page that loads when someone connects to the Heroku server.
JSPsych MUST be loaded first. Plugins MUST be loaded second but they MAY be in any order.
`tasks.js` MUST be loaded after plugins. `engine.js` MUST be loaded last as its loading starts the task.

## Engine

The engine is the script that creates the JSPsych timelines. 
As it stands, there are five separate JSPsych timelines.
Each one has an ending hook attached to it, which triggers JSPsych to load the next timeline.
The first is the practice round it's always the same, it just loads all of the trials with difficulty set to "practice". It does not shuffle them.
The next three are loaded from all trials with difficulty set to "easy", "medium", and "hard" respectively. These are shuffled.
The last block, the EndBlock, contains the MIQ and the long term questions. 

## Tasks

This file is where you should put any new tasks. They largely use builtin JSPsych plugins, but some of them use custom ones.
I'm not going to explain here how to write JSPsych plugins, their docs are better for that.
However, I will detail how this program expects you to wrap their plugins for if you're making novel items.
There are three function signatures that you can use, if you need to make an item and you can't use one of these signatures, you will have to edit the `dat2Func` function in `engine.js` to accept your new signature.
`dat2Func` is a function that takes as input the raw json data from `qblock.json` and turns it into a function that will generate the proper timeline object for that task.

If you can fit your new task into one of the pre-existing signatures, then you don't need to do anything but put a function that generates a JSPsych timeline in `tasks.js`, and then add your new function to the `name2Func` object in `engine.js`. The three signatures are:

 - Stimuli, Trials
    - These are the tasks that have both a set of stimuli and a set of trials that are separate from those stimuli.
      Things like the episodic memory tasks for example.
    - Signature is `func(stimuli, trials, data)`
- Stimuli, Delay
    - These are the tasks that have a set of stimuli that you need to react to with some delay. For example, the stroop task, the processing speed task (here delay controls how much time the subject is given), and the working memory tasks.
    - Signature is `func(stimuli, delay, data)`
- Questions
    - These are the tasks that have a "question" parameter. It's just the end survey.
    - Signature is `func(question, data)`
- Trials
    - These are the tasks that just have trials in their control CSV. This is just RuleID. There isn't a good reason that they are classed as "Trials" instead of stimuli, but they are.
    - Signature is `func(stimuli, data)`.

You'll notice that all of these have a `data` parameter. This is an arbitrary object that you can pass to JSPsych timelines. All new functions in the `tasks.js` file must support this parameter.

Your new task should be a function that outputs a JSPsych timeline. 

## Sending Data to the Heroku Server

This is handled by `write_data.php`, this PHP file runs an SQL upsert on the Heroku database. Feed it with an AJAX call. 
It is designed to take as input a JSON version of a JSPsych data object made by: `JSON.stringify` or `JSPsych.data.get().json()`. 
