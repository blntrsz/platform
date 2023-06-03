#! /bin/bash

STAGE="$1"

rm .env

echo "## ISSUES ENV VARS" >> .env

echo "VITE_ISSUES_API_URL=http://localhost:9001" >> .env

echo "VITE_ISSUES_SITE=http://localhost:5001" >> .env

echo "ISSUES_CLUSTER_ARN=$(aws cloudformation describe-stacks --stack-name issues-app-$STAGE --query 'Stacks[0].Outputs[?ExportName==`issuesDB'$STAGE'-cluster-arn`].OutputValue' --output text)" >> .env

echo "ISSUES_SECRET_ARN=$(aws cloudformation describe-stacks --stack-name issues-app-$STAGE --query 'Stacks[0].Outputs[?ExportName==`issuesDB'$STAGE'-secret-arn`].OutputValue' --output text)" >> .env

echo "ISSUES_CLUSTER_NAME=$(aws cloudformation describe-stacks --stack-name issues-app-$STAGE --query 'Stacks[0].Outputs[?ExportName==`issuesDB'$STAGE'-cluster-name`].OutputValue' --output text)" >> .env


echo $'\n' >> .env


echo "## USERS ENV VARS" >> .env

echo "VITE_USERS_API_URL=http://localhost:9002" >> .env

echo "VITE_USERS_SITE=http://localhost:5002" >> .env

echo "USERS_CLUSTER_ARN=$(aws cloudformation describe-stacks --stack-name users-app-$STAGE --query 'Stacks[0].Outputs[?ExportName==`usersDB'$STAGE'-cluster-arn`].OutputValue' --output text)" >> .env

echo "USERS_SECRET_ARN=$(aws cloudformation describe-stacks --stack-name users-app-$STAGE --query 'Stacks[0].Outputs[?ExportName==`usersDB'$STAGE'-secret-arn`].OutputValue' --output text)" >> .env

echo "USERS_CLUSTER_NAME=$(aws cloudformation describe-stacks --stack-name users-app-$STAGE --query 'Stacks[0].Outputs[?ExportName==`usersDB'$STAGE'-cluster-name`].OutputValue' --output text)" >> .env
