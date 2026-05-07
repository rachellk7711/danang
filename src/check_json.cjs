const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/afra/Documents/다낭여행/danang_content_db.json', 'utf8'));
console.log('Main keys:', Object.keys(data));
if (data.attractions) {
  console.log('Attractions categories (danang):', [...new Set(data.attractions.danang.map(x => x.category))]);
  console.log('Attractions categories (hoian):', [...new Set(data.attractions.hoian.map(x => x.category))]);
}
if (data.restaurants) {
  console.log('Restaurants types:', Object.keys(data.restaurants));
}
console.log('Any hidden cafes?:', data.cafes ? 'Yes' : 'No');
console.log('Any markets_marts?:', data.markets_marts ? 'Yes' : 'No');
