const reader = require('../src/read-pom');
const pomFiles = [
    'C:\\work\\cob\\cob_portal_template\\pom.xml',
    'C:\\work\\cob\\cob_portal_style\\pom.xml',
    'C:\\work\\cob\\cob_portal_kit\\pom.xml',
    'C:\\work\\cob\\desk_individual_customer1\\pom.xml',
    'C:\\work\\cob\\individualch\\pom.xml',
    'C:\\work\\cob\\desk_individual\\pom.xml',
    'C:\\work\\cob\\cob_basic_component\\pom.xml',
    'C:\\work\\cob\\cob_portalcustomization\\pom.xml',
    'C:\\work\\cob\\cob_standard\\pom.xml',
];

console.log(reader(pomFiles));