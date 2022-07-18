# vocabapp-server
Serverside for Vocab App, code in NodeJS (with express)

# Deployment Guide
1. Download the project
2. Create new directory in local PC, move all files to new folder
3. run "npm install" to install all dependencies
4. run npm start and test the program
5. When testing is completed,zip everything without .git and .vscode folder, folder structure should be like this:
![EB_1](https://i.imgur.com/AAEWU62.png "EB_1")
6. On AWS Elastic Beanstalk, click "upload and deploy" and upload the zip file

# Create a Elastic Beanstalk
[https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/GettingStarted.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/GettingStarted.html)
Note: Select platform "Node.js running on 64bit Amazon Linux/4.17.18"
