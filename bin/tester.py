from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup
from random import choice, randint
from time import sleep
from argparse import ArgumentParser
from idmaker import make_id

parser = ArgumentParser()
parser.add_argument('--main', help='The --main flag tells the testing system to use the main server.',
                    action='store_true')
parser.add_argument('--test', help='The --test flag tells the testing system to use the test server.',
                    action='store_true')
args = parser.parse_args()

testID = 'T_' + make_id()

if not args.main ^ args.test:
    if args.main:
        raise ValueError('Cannot test on both servers at the same time, '
                         'please run the script in two different instances to do this.')
    else:
        raise ValueError('You must choose a server to test, please run the script with either a '
                         '--main flag or a --test flag.')

TEST_APP = 'floating-garden-78151'
MAIN_APP = 'web-o54'

if args.main:
    APP_URL = 'https://' + MAIN_APP + '.herokuapp.com/?RID=' + testID
elif args.test:
    APP_URL = 'https://' + TEST_APP + '.herokuapp.com/?RID=' + testID


class Scene:
    """
    doesn't do a lot right now, but will be extended to do other things when I eventually make the tester to actually
    get questions right.
    """

    def __init__(self, soup: BeautifulSoup):
        self.soup = soup
        self.content = soup.find('div', {'id': 'jspsych-content'})
        try:
            self.kind = self.ascertain_kind()
        except (IndexError, KeyError, AttributeError):
            self.kind = 'wait'
            sleep(1)

    def ascertain_kind(self):
        buttons = self.content.find('button')
        if buttons:
            return 'buttons'
        elif 'Press any key' in self.content.contents[1].text:
            return 'anykey'
        elif 'Press space' in self.content.contents.text:
            return 'space'
        elif 'categorize-html' in self.content.contents[0]['class'][0]:
            return 'cathtml'
        elif 'string-entry' in self.content.contents[0]['class'][0]:
            return 'strentry'
        elif not self.content:
            return 'yeet'
        return 'wait'


class Tester:
    def __init__(self):
        self.driver = webdriver.Chrome()
        self.driver.get(APP_URL)
        element = WebDriverWait(self.driver, 10).until(ec.presence_of_element_located((By.ID, 'jspsych-content')))
        self.done = False

    def get_scene(self):
        soup = BeautifulSoup(self.driver.page_source, features='html.parser')
        scene = Scene(soup)
        return scene

    def respond_random(self, scene):
        if scene.kind == 'buttons':
            buttons = self.driver.find_elements_by_class_name('jspsych-btn')
            firstbuttontext = buttons[0].text
            if firstbuttontext == 'yes':
                buttons[0].click()
            else:
                choice(buttons).click()
            if firstbuttontext == 'Continue':
                WebDriverWait(self.driver, 5)
        elif scene.kind == 'anykey':
            actions = ActionChains(self.driver)
            actions.send_keys(Keys.ENTER)
            actions.perform()
        elif scene.kind == 'space':
            actions = ActionChains(self.driver)
            actions.send_keys(Keys.SPACE)
            actions.perform()
        elif scene.kind == 'cathtml':
            actions = ActionChains(self.driver)
            actions.send_keys(str(choice([1, 2, 3, 4])))
            actions.perform()
        elif scene.kind == 'strentry':
            actions = ActionChains(self.driver)
            actions.send_keys(str(randint(0, 9999999)))
            actions.perform()
        elif scene.kind == 'yeet':
            self.done = True
        elif scene.kind == 'wait':
            WebDriverWait(self.driver, 1)

    def run_test(self, random=True):
        if random:
            while not self.done:
                WebDriverWait(self.driver, 1)
                scene = self.get_scene()
                self.respond_random(scene)


if __name__ == '__main__':
    tester = Tester()
    tester.run_test()