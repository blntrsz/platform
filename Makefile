deploy_issues_tools:
	export STAGE=tools && cdk deploy issues-tools --require-approval never

deploy_users_tools:
	export STAGE=tools && cdk deploy users-tools --require-approval never

deploy_host_tools:
	export STAGE=tools && cdk deploy host-tools --require-approval never

deploy_tools: deploy_issues_tools deploy_users_tools deploy_host_tools

destroy_issues_tools:
	export STAGE=tools && cdk destroy issues-tools --require-approval never

deploy_issues_dev:
	pnpm cdk deploy issues-app-dev --require-approval never

deploy_users_dev:
	pnpm cdk deploy users-app-dev --require-approval never

deploy_host_dev:
	export VITE_ISSUES_SITE=https://$(aws cloudformation describe-stacks --stack-name issues-app-dev --query 'Stacks[0].Outputs[?ExportName==`frontendUrl-issues-dev`].OutputValue' --output text) &&\
	export VITE_USERS_SITE=https://$(aws cloudformation describe-stacks --stack-name users-app-dev --query 'Stacks[0].Outputs[?ExportName==`frontendUrl-users-dev`].OutputValue' --output text) &&\
	pnpm cdk deploy host-app-dev --require-approval never

deploy_dev: deploy_issues_dev deploy_users_dev deploy_host_dev
