"""
This is a module full of solvers for the
"""
from abc import abstractmethod
from itertools import compress
import numpy as np
import json

class Trial(object):
    def __init__(self, kind):
        self.kind = kind

    @classmethod
    def create(cls, kind):
        return globals()[kind]()

    @abstractmethod
    def solve(self, stimuli, trial):
        return None

    def batch_solve(self, stimuli, trials):
        results = []
        if len(trials) != 0:
            for trial in trials:
                results.append(self.solve(stimuli, trial))
        else:
            for stim in stimuli:
                results.append(self.solve(stim, trials))
        return results


class EpisodicMemory(Trial):
    """
    The EM Tasks are stored in the questions folder the same way, but they're tagged differently
    because jsPsych renders them using different plugins.
    """
    def solve(self, stimuli, trial):
        mask = [b in stimuli for b in trial]
        # okay this is a tad complex.
        # compress filters all of the elements in the first argument (which is the indices of mask) that
        # are in the same spot as "True"s in the second argument. Since we expect only one, and it
        # returns a list, then we take the first element (of one). We assert this to doublecheck.
        truind = list(compress(range(len(mask)), mask))
        assert len(truind) == 1, "Word Stim had some number of answers that isn't one, double check it."
        return trial[truind[0]]


class EMWordStim(EpisodicMemory):
    def __init__(self):
        super(EpisodicMemory, self).__init__('EMWordStim')


class EMObjectPicture(EpisodicMemory):
    def __init__(self):
        super(EpisodicMemory, self).__init__('EMObjectPicture')


class SMObjectNaming(Trial):
    def __init__(self):
        super(SMObjectNaming, self).__init__('SMObjectNaming')

    def solve(self, stimuli, trial):
        assert isinstance(stimuli, str), 'Object Naming answer is not defined for more than one stimuli.'
        return stimuli

    def batch_solve(self, stimuli, trials):
        ans = []
        for stim in stimuli:
            ans.append(stim)
        return ans


class DigitSpan(Trial):
    def solve(self, stimuli, trial):
        assert isinstance(stimuli, str), 'Digit Span answer is not defined for more than one stimuli.'
        return stimuli


class WMForwardDigitSpan(DigitSpan):
    def __init__(self):
        super(DigitSpan, self).__init__('WMForwardDigitSpan')


class WMBackwardDigitSpan(DigitSpan):
    def __init__(self):
        super(DigitSpan, self).__init__('WMBackwardDigitSpan')


class EFStroop(Trial):
    def __init__(self):
        super(EFStroop, self).__init__('EFStroop')
        self.codes_and_keys = {
            'R': 'Red',
            'K': 'Black',
            'G': 'Green',
            'Y': 'Yellow',
            'P': 'Purple'
        }

    def solve(self, stimuli, trials):
        num = 0
        for stim in stimuli.split():
            a, b = stim.split('.')
            b = self.codes_and_keys[b]
            if a == b:
                num += 1
        return str(num)


class EFRuleID(Trial):
    def __init__(self):
        super(EFRuleID, self).__init__('EFRuleID')

    def solve(self, stimuli, trial):
        shapes = []
        colors = []
        numbers = []
        for tr in trial:
            shapes.append(tr[0])
            colors.append(tr[1])
            numbers.append(tr[2])

        uniques = [len(set(thing)) for thing in [shapes, colors, numbers]]
        ans = ['shape', 'color', 'number'][int(np.argmin(uniques))]
        return ans


class PSStringComparison(Trial):
    def __init__(self):
        super(PSStringComparison, self).__init__('PSStringComparison')

    def solve(self, stimuli, trial):
        a, b = stimuli.split('-')
        if a == b:
            return 'same'
        else:
            return 'different'

class LongTerm(Trial):
    def __init__(self):
        super(LongTerm, self).__init__('LongTerm')

    def solve(self, stimuli, trial):
        """
        This is admittedly a little jank. I apologise. The stimuli input should be an item that
        is being repeated for the long term tasks. This is, I think, the most elegant solution.
        Trial should be the integer trial number.
        Parameters
        ----------
        stimuli
        trial

        Returns
        -------

        """
        with open('questions/json/qblock.json') as f:
            qblock = json.load(f)

        infoblock = qblock[stimuli]

        solver = Trial.create(infoblock['kind'])
        ans = solver.solve(infoblock['stimuli'], infoblock['trials'][trial])
        return ans
