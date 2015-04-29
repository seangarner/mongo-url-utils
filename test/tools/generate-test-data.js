/**
 * used to create test/assets/test_data.json file
 *
 * requires that faker is installed first
 */

var faker = require('faker');

if (process.argv.length < 3) {
  console.log('USE ./generate-test-data.js <number of documents to generate>');
  process.exit(1);
}

var i = 0;
console.log('[');
while (++i < parseInt(process.argv[2], 10)) {
  console.log(JSON.stringify(doc(), null, 2) + ',');
}
console.log(JSON.stringify(doc(), null, 2));
console.log(']');


function grades(count) {
  var _grades = [];
  for (var i = 0; i < count; i++) {
    _grades.push({
      date: faker.date.recent(),
      grade: faker.random.array_element(['A', 'B', 'C', 'D', 'E', 'F']),
      score: faker.random.number({min: 1, max: 5})
    });
  }
  return _grades;
}

function doc() {
  return {
    id: i,
    address : {
      building: faker.address.streetAddress(),
      coord: [
        faker.address.latitude(),
        faker.address.longitude()
      ],
      street: faker.address.streetName(),
      zipcode: faker.address.zipCode()
    },
    borough: faker.address.county(),
    cuisine: "Bakery",
    grades: grades(faker.random.number({min: 1, max: 4})),
    name: faker.company.companyName(),
    restaurant_id: faker.random.number({min: 1000000, max: 9999999}).toString()
  };
}