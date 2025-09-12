# Memory Maths

This is a NextJS web application that helps you practice and improve your mental arithmetic skills.
It has three phases: Learning, Practice, and Test.

## Learning Phase

The user chooses between

- Addition
- Subtraction
- Multiplication
- Division

They then select a range of numbers using a slider, between 2 and 20, and a base number that will be used in the calculations.

The app then generates a list of all the calculations based on the selected operation, range, and base number.
It displays the calculations in a grid format, with all the answers shown initially.
The user can click on each calculation to hide the answer, allowing them to practice recalling the answers from memory.

At any point, the user can click a button to move to the Practice Phase.

## Practice Phase

In the Practice Phase, the user is presented with the same calculations as in the Learning Phase, but this time the answers are hidden
and randomised in order, and presented one at a time. A keypad is provided for the user to input their answers, including a delete button, so they do not
need to activate the keyboard. This makes it more usable on a touch device. The design is responsive, so on a wide screen the
keypad is displayed to the right of the calculations, while on a narrow screen it is displayed below.

If the user does not know the answer to a calculation, they can click a "Show Answer" button to reveal multiple choice options,
one of which is the correct answer. The choices are radomised in order, and should be fairly close to the correct answer to make it challenging.
The user can then click an answer to fill it in. If they get it wrong, a counter is incremented to keep track of how many mistakes they have made
in this practice session. When they get it right, the answer is filled in and they can move on to the next calculation.

Once all answers have been filled in, the user can click a button to move to the Test Phase. Before transitioning to the Test Phase,
the user is shown a summary of how many mistakes they made in the Practice Phase, and how this compares to their progress against previous sessions.  
These statistics are stored in local storage, so they persist between sessions. The comparison should use nice visualisations to make it easy to understand.
They should show the difference in performance in the same operation, e.g. does their addition get worse when they use larger numbers?
It should also show the difference in performance between operations, e.g. is their multiplication better than their addition?

## Test Phase

In the Test Phase, the user is presented with the same calculations as in the Practice Phase, but this time there are no multiple choice options.
The user must input their answers using the keypad. If they get it wrong, a counter is incremented to keep track of how many mistakes they have made
in this test session. When they get it right, the answer is filled in and they can move on to the next. They can also choose to skip a question
and come back to it later, but this will also increment the mistake counter.

Once they have completed all calculations, or completed and skipped all, they are shown a summary of how many mistakes they made in the Test Phase,
in the same manner as the Practice Phase. This is also stored in local storage, so they can track their progress over time.

## Profiles

The app supports multiple user profiles, so different users can track their progress separately.
When the app is first loaded, the user is prompted to create a profile by entering a name.
The profile is stored in local storage, along with the user's progress data.
The user can switch between profiles by clicking on their name in the header, which opens a dropdown menu with a list of profiles.
They can also create a new profile or delete an existing one from this menu.
The app should remember the last used profile and automatically load it when the app is opened.
The profile data is stored in local storage, so it persists between sessions.
The app should also support a guest profile, which does not require a name and is not stored in local storage. If the user
makes progress while using the guest profile, they should be prompted to create a named profile before they can save their progress after they complete their
first phase.
