// import pino from "pino";

// // Configure the Pino logger. Use pretty-print in development mode for easier readability.
// const logger = pino({
//   level: process.env.NODE_ENV === "production" ? "info" : "debug", // Adjust log level based on the environment
//   transport:
//     process.env.NODE_ENV === "production"
//       ? undefined // In production, use default (JSON)
//       : {
//           target: "pino-pretty", // Use pino-pretty in development for human-readable logs
//           options: { colorize: true, translateTime: "SYS:standard" },
//         },
// });

// export default logger;

// /*

// It is recommended to use pino-pretty with pino by piping output to the CLI tool:

// node app.js | pino-pretty

// pino-pretty should be used for DEVELOPMENT only!

// */
