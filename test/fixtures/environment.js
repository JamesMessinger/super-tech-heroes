'use strict';

// If you leave these environment variables blank, then the AWS SDK will automatically
// read your credentials from ~/.aws/credentials
setEnv('AWS_ACCESS_KEY_ID', '');
setEnv('AWS_SECRET_ACCESS_KEY', '');
setEnv('AWS_SESSION_TOKEN', '');

// These environment variables mimic AWS Lambda
setEnv('AWS_REGION', 'us-east-1');
setEnv('LAMBDA_TASK_ROOT', process.cwd());
setEnv('LAMBDA_RUNTIME_DIR', process.cwd());

// These environment variables are required by the Super Tech Heroes Lambda function
setEnv('SUPER_TECH_HEROES_TABLE_NAME', 'SuperTechHeroes.Characters');
setEnv('SUPER_TECH_HEROES_TTL_HOURS', '4');

// Enable "test mode"
setEnv('NODE_ENV', 'test');

/**
 * Sets an environment variable, unless it's already set.
 *
 * @param {string} name - The environment variable name
 * @param {string} value - The value to set, unless a value is already set
 */
function setEnv (name, value) {
  if (!process.env[name]) {
    process.env[name] = value;
  }
}
