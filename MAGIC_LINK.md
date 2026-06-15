# 🪄 Magic Link — How to Use

## For the Data Entry Person

### 1. Open any free AI chat (Gemini, ChatGPT, Claude)

### 2. Copy and paste this prompt, then upload the recipe photo:

```
Act as a professional recipe assistant. Analyze the attached image of a handwritten recipe (Chinese or English).

Extract the recipe information and translate everything to English.

At the very end of your response, output a single clickable "Magic Link" in this exact format, replacing the bracketed text with your extracted data (URL-encode spaces as %20):

http://localhost:5174/#/admin?title=[Recipe Name]&subtitle=[Short Description]&desc=[Brief Description]&prep=[Prep Time]&cook=[Cook Time]&servings=[Number]&type=[snack/dish/dessert]&cuisine=[Cuisine Type]&image=[Optional Image URL]

Example:
http://localhost:5174/#/admin?title=Crispy%20Tempeh&subtitle=Traditional%20Sabah%20Snack&desc=Made%20with%20fermented%20soybean%20cake&prep=15%20minutes&cook=10%20minutes&servings=4&type=snack&cuisine=Malaysian
```

### 3. The AI will generate a clickable link
### 4. Click the link → it opens your admin with the form already filled
### 5. Review, add ingredients/instructions manually, then Publish

---

## If Admin is Deployed Live
Replace `http://localhost:5174` with your live admin URL:
```
https://antwebapps.net/temtemsabah/#/admin?title=...
```
