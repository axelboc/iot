const dotenv = require('dotenv').config();
const logger = require('./_lib/logger');
const api = require('./_lib/api');

const WELL_KNOWN_FLAG = '--wk';

// Retrieve current project
const project = require(`./${process.env.PROJECT}`);

// Login
api.login(process.env.email, process.env.password)
  .then(({ token: userToken }) => {
    // List nodes
    return api.listNodes(userToken);
  })
  .then(({ nodes }) => {
    // Get first node
    return nodes.length > 0 ? nodes[0] : Promise.reject('node not found');
  })
  .then(node => {
    // Check if ready
    if (node.online) {
      nodeReady(node, project, process.argv[2] === WELL_KNOWN_FLAG);
    } else {
      return Promise.reject('node offline');
    }
  })
  .catch(error => {
    // Catch all errors
    logger.error(error);
  });

/**
 * The node is ready.
 * Start project, optionally after printing its well-known.
 * @param {Object} node
 * @param {Module} project
 * @param {Boolean} printWellKnown - whether to print the well-known of the node
 */
function nodeReady(node, project, printWellKnown) {
  logger.info('node ready');

  if (printWellKnown) {
    // Print well-known then start project
    api.getWellKnown(node.node_key)
      .then(wellKnown => {
        logger.info('well-known', wellKnown.well_known);
        startProject(node, project);
      })
  } else {
    // Start project right away
    startProject(node, project);
  }
}

/**
 * Start project.
 * @param {Object} node
 * @param {Module} project
 */
function startProject(node, project) {
  logger.info(`starting ${process.env.PROJECT}`);
  project.start(node);
}
