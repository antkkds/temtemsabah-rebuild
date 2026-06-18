// Demo: Magic Key full flow — call AI → parse → fill fields
import { readFileSync } from 'fs';

// Load the parser from vision.js
const visionSrc = readFileSync('src/lib/vision.js', 'utf8');

// Extract the parseRecipeResponse function
const fnMatch = visionSrc.match(/function parseRecipeResponse\(text\) \{[\s\S]*?\n\}/);
if (!fnMatch) { console.log("Could not extract parseRecipeResponse"); process.exit(1); }

// Execute it in a sandbox
const parseRecipeResponse = eval('(' + fnMatch[0] + ')');

// Test with sample AI output that matches the expected format
const sampleAIOutput = `Title: Cream Soup Tempeh

==MAIN==
- 2 pieces Steam Tempeh
- ½ head Broccoli
- ½ stick Carrot
- 5 pieces Shiitake Mushrooms
- 1 cob Corn
- 1 section Lotus Root

==SEASONINGS==
- 3 cloves Garlic
- 1 inch Ginger
- 2 tbsp Soy Sauce
- 1 tsp Salt
- ½ tsp White Pepper
- 500ml Vegetable Broth
- 200ml Coconut Milk

==STEPS==
- Cut tempeh into small cubes and steam for 10 minutes
- Chop all vegetables into bite-sized pieces
- Sauté garlic and ginger until fragrant
- Add vegetables and stir-fry for 2 minutes
- Pour in vegetable broth and bring to a boil
- Add steamed tempeh and simmer for 5 minutes
- Stir in coconut milk and season with soy sauce, salt, and pepper
- Simmer for another 3 minutes and serve hot`;

console.log('=== RAW AI OUTPUT ===');
console.log(sampleAIOutput);
console.log('\n');

const result = parseRecipeResponse(sampleAIOutput);

console.log('=== PARSED RESULT ===');
console.log(JSON.stringify(result, null, 2));

console.log('\n=== HOW FIELDS MAP TO FORM ===');
console.log('Title        ->', result.title);
console.log('Subtitle     ->', result.subtitle || '(empty)');
console.log('Description  ->', (result.description || '').substring(0, 60) + '...');
console.log('Prep         ->', result.prep || '(empty)');
console.log('Cook         ->', result.cook || '(empty)');
console.log('Servings     ->', result.servings || '(empty)');

console.log('\n=== INGREDIENT GROUPS ===');
result.ingredients.forEach((g, i) => {
  console.log(`Group ${i + 1}: "${g.group}"`);
  g.items.forEach(item => {
    console.log(`  - ${item[0]} (${item[1]})`);
  });
});

console.log('\n=== INSTRUCTIONS ===');
result.instructions.forEach((step, i) => {
  console.log(`${i + 1}. ${step}`);
});
