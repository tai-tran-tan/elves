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

const pomFiles = [
    '/home/tttai/work/source/mvn-test-projects/child-app/pom.xml', 
    '/home/tttai/work/source/mvn-test-projects/parent-app/pom.xml', 
    '/home/tttai/work/source/mvn-test-projects/grand-child-app/pom.xml'
];
const flatModules = [];
pomFiles.map(file => {
    const node = readPomFileSync(file).project;
    node['pomFile'] = file;
    flatModules.push(node);
});

console.log('flatModuleList:', flatModules);

const identityFields = ['groupId', 'artifactId', 'version'];

const dependenciesTree = {};
const sorted = flatModules.sort(function(left, right){
   if (left?.dependencies || right?.dependencies) {
       return isADependency(left, right) ? -1 : 1;
   }
   return 0;
});

console.log('Sorted:', sorted);

/**Returns true if left depends on right */
function isADependency(left, right) {
    if(left.dependencies) {
        const rightId = right.pomFile;
        return Object.values(left.dependencies).some(dependency => {
            if (dependency.pomFile == rightId) {
                return true;
            }
        });
    }
    return false;
}

function getIdentity(data) {
    const identity = {};
    identityFields.forEach(field => identity[field] = data[field]);
    return identity;
}

function getPomFile(identity) {
    for (const pomFile in flatModules) {
        const pomContent = flatModules[pomFiles];
        const pomIdentity = getIdentity(pomContent);
        if (identity == pomIdentity) {
            return pomFile;
        }
    }
}