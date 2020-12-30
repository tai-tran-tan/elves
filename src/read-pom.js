const parser = require('fast-xml-parser');
const fs = require('fs');

const fileOpts = { encoding: 'utf-8' };
function readPomFile(filePath, callback) {
    fs.readFile(filePath, fileOpts, (err, data) => {
        let jsonPom = convertToJson(data);
        callback(jsonPom);
    })
}

function readPomFileSync(filePath) {
    let data = fs.readFileSync(filePath, fileOpts);
    return convertToJson(data);
}

function convertToJson(data) {
    let pom = parser.getTraversalObj(data);
    let jsonPom = parser.convertToJson(pom, {arrayMode: false});
    return jsonPom;
}

function generateDependencyTree(pomFiles) {
    const flatModules = pomFiles.map(file => {
        const node = readPomFileSync(file).project;
        node['pomFile'] = file;
        if (node?.dependencies?.dependency) {
            const dependencies = node.dependencies.dependency;
            node.dependencies.dependency = getDependencyNodeAsArray(dependencies);
        }
        return node;
    });
    
    let rootModules = flatModules.filter(element => !element?.dependencies?.dependency.some(dependency => {
        return !!getModule(flatModules, dependency)
    }));
    return rootModules;
}

function getModule(flatModules, dependency) {
    for (const i in flatModules) {
        let module = flatModules[i];
        if (equals(module, dependency)) return module;
    }
}

function equals(left, right) {
    return left.artifactId == right.artifactId && left.groupId == right.groupId && left.version == right.version;
}

function getDependencyNodeAsArray(dependencies) {
    if (!Array.isArray(dependencies)) {
        return [dependencies];
    }
    return dependencies;
}

// console.log('flatModuleList:', flatModules);

// console.log('Sorted:', sorted);

/**Returns true if left depends on right */
function compare(left, right) {
    if (isLeftDependsOnRight(left, right)) {
        console.log(left.artifactId, 'depends on', right.artifactId);
        return -1;
    } else if (isLeftDependsOnRight(right, left)) {
        console.log(right.artifactId, 'depends on', left.artifactId);
        return 1;
    }
    console.log(right.artifactId, 'equals', left.artifactId);
    return 0;
}

function isLeftDependsOnRight(left, right) {
    if(left.dependencies) {
        const rightId = right.pomFile;
        return Object.values(left.dependencies.dependency).some(dependency => equals(dependency, right));
    }
    return false;
}

module.exports = generateDependencyTree;