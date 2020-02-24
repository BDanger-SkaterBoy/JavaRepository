export default () => (
  <p>
    {JSON.stringify({
      LOCAL_ENV_FILE_KEY: process.env.NC_LOCAL_ENV_FILE_KEY,
      ENV_FILE_KEY: process.env.NC_ENV_FILE_KEY,
      PRODUCTION_ENV_FILE_KEY: process.env.NC_PRODUCTION_ENV_FILE_KEY,
      LOCAL_PRODUCTION_ENV_FILE_KEY:
        process.env.NC_LOCAL_PRODUCTION_ENV_FILE_KEY,
      DEVELOPMENT_ENV_FILE_KEY: process.env.NC_DEVELOPMENT_ENV_FILE_KEY,
      LOCAL_DEVELOPMENT_ENV_FILE_KEY:
        process.env.NC_LOCAL_DEVELOPMENT_ENV_FILE_KEY,
    })}
  </p>
)
