import { CfnOutput } from "aws-cdk-lib";
import { IGrantable } from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

export class Database extends Construct {
  cluster: rds.ServerlessCluster;
  clusterName: string;

  constructor(scope: Construct, id: string, clusterName: string) {
    super(scope, id);
    this.clusterName = clusterName;

    this.cluster = new rds.ServerlessCluster(this, "Cluster", {
      clusterIdentifier: `${this.clusterName}Cluster`,
      defaultDatabaseName: this.clusterName,
      enableDataApi: true,
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_11_13,
      }),
    });

    new CfnOutput(this, "cluster-arn", {
      exportName: `${clusterName}-cluster-arn`,
      value: this.cluster.clusterArn,
    });

    new CfnOutput(this, "secret-arn", {
      exportName: `${this.clusterName}-secret-arn`,
      value: this.cluster.secret?.secretArn ?? "",
    });

    new CfnOutput(this, "cluster-name", {
      exportName: `${this.clusterName}-cluster-name`,
      value: this.clusterName,
    });
  }

  getEnv() {
    return {
      CLUSTER_ARN: this.cluster.clusterArn,
      SECRET_ARN: this.cluster.secret?.secretArn ?? "",
      CLUSTER_NAME: this.clusterName,
    };
  }

  grantApiAccess(grant: IGrantable) {
    this.cluster.grantDataApiAccess(grant);
  }
}
