import { Token } from "aws-cdk-lib";

export function getBuildCmdEnvironment(siteEnvironment?: {
  [key: string]: string;
}): Record<string, string> {
  // Generate environment placeholders to be replaced
  // ie. environment => { API_URL: api.url }
  //     environment => API_URL="{{ API_URL }}"
  //
  const buildCmdEnvironment: Record<string, string> = {};
  Object.entries(siteEnvironment || {}).forEach(([key, value]) => {
    buildCmdEnvironment[key] = Token.isUnresolved(value)
      ? `{{ ${key} }}`
      : value;
  });

  return buildCmdEnvironment;
}
