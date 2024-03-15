This ReadMe file is for the initial test phase of the MVP project. 

Installation and running of the project files: 
  1) Visit nodejs.org and download the latest stable verson of node. 
  2) Install node onto your computer. The default settings are fine.
  3) Download a copy of this Repo.
     You can download a copy of this repo by going to the main repo page and clicking the Green Code button and
     selecting download zip from the drop down that appears.
  5) Unzip it in a location that you want to use as a working directory
  6) In your terminal or command line navigate to the location that you unzipped the repo to.
  7) In your terminal or command line type npm install, This should install all of the required dependencies
  8) Type npm start to run the start script and launch the actual electron application.

Packaging of the Program for different OS distributions:
   1) Run the following commands in the directory in which the project code resides depending on your OS needs
   2) Windows:
      npm run package:win
   3) macOS:
      npm run package:mac
   4) Linux:
      npm run package:linux