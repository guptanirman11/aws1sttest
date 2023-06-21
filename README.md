# R56 Web

R56 is the project to collect pilot data for a Computerized Adaptive Test for Cognition (CAT-COG). This is the Javascript version of it for use in web browsers.

[Current Location](https://uchicago.co1.qualtrics.com/jfe/form/SV_bd7jEAFxEnKiqUd)

# Tasks

R56 will have 9 tasks programmed into it, meant to probe 5 domains of cognitive function. The tasks are all designed to have variable difficulty, and to confound one another as little as possible.

<center>

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

</center>

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

The stimulus phase for Nonsense Words tasks cconsists of a set of english-sounding, but meaningless words. The choices phase is a set of nonsense words. Harder items render the choices as words that are phonetically close to the stimuli.

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

### Rule Identification


![](RuleIDEx.png)

The subject is shown a series of colored shapes. 

## Processing Speed

### String Comparison

## Usage Notes

<!-- TODO: URGENT -->