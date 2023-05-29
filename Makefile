deploy_issues_tools:
	export STAGE=tools && cdk deploy issues-tools --require-approval never

deploy_users_tools:
	export STAGE=tools && cdk deploy users-tools --require-approval never

deploy_host_tools:
	export STAGE=tools && cdk deploy host-tools --require-approval never

deploy_tools: deploy_issues_tools deploy_users_tools deploy_host_tools

destroy_issues_tools:
	export STAGE=tools && cdk destroy issues-tools --require-approval never

destroy_users_tools:
	export STAGE=tools && cdk destroy users-tools --require-approval never

destroy_host_tools:
	export STAGE=tools && cdk destroy host-tools --require-approval never

destroy_tools: destroy_issues_tools destroy_users_tools destroy_host_tools