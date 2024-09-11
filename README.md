# MathGenie
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcnkang%2Fmathgenie.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcnkang%2Fmathgenie?ref=badge_shield)


MathGenie is a small web application built using React, designed to help tutors generate math problems focusing on basic arithmetic operations. With this application, you can customize the range of numbers, the allowed operations, the number of problems, and more, then generate a PDF file with the problems to share with students.

## Features

- **Select Operations**: Choose which operations (+, -, ✖, ➗) to include in the generated problems.
- **Customize Number Range**: Define the range of numbers used as operands.
- **Set Result Range**: Define the acceptable range for results.
- **Number of Problems**: Specify how many problems to generate.
- **Operands Range**: Set the range for the number of operands per problem.
- **Negative Results**: Optionally allow negative results.
- **Show Answers**: Choose whether to display answers next to the problems.
- **PDF Customization**: Specify the font size, line spacing, and paper size of the generated PDF.
- **Download PDF**: Generate and download a PDF file with the customized problems.

## Installation

1. Clone or download this repository.
2. Navigate to the project directory.

    ```bash
    cd /path/to/your/project
    ```

3. Install the necessary dependencies.

    ```bash
    npm install
    ```

4. Start the development server.

    ```bash
    npm start
    ```

5. Open your web browser and go to `http://localhost:3000`.

## Usage

1. Open the application in your browser.

2. Customize the settings:
    - **Select Operations**: Choose the arithmetic operations to be used.
    - **Number Range**: Define the range of numbers for the operands.
    - **Result Range**: Specify the acceptable range for calculation results.
    - **Number of Problems**: Enter the number of problems you want to generate.
    - **Number of Operands**: Adjust the range for the number of operands in each problem.
    - **Allow Negative Results**: Check or uncheck to allow or disallow negative results.
    - **Show Answers**: Check or uncheck to display or hide answers.
    - **Font Size**: Define the font size for the PDF.
    - **Line Spacing**: Define the line spacing for the PDF.
    - **Paper Size**: Choose the paper size (A4, Letter, Legal).

3. Click `Generate Problems` to create the math problems.

4. Review the generated problems displayed on the page.

5. Click `Download PDF` to save the problems as a PDF file.

## Example

After configuring the settings:

1. Set the number range from 1 to 10.
2. Allow only addition and subtraction.
3. Generate 10 problems.
4. Display answers.
5. Save the results in a PDF file.

## Contributing

We welcome contributions! Please fork the repository and submit a pull request for any improvements.

## License

This project is open-source and available under the [MIT License](LICENSE).


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcnkang%2Fmathgenie.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcnkang%2Fmathgenie?ref=badge_large)

## Dependencies

- `react`: JavaScript library for building user interfaces.
- `jspdf`: JavaScript library for generating PDF documents.
- `./App.css`: Custom CSS file for styling (imported in `App.js`).

## Acknowledgements

Thank you for using MathGenie! This application is designed to make math practice more accessible and efficient for both educators and students.