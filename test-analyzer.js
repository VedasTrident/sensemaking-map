// Quick test of the analyzer
const fs = require('fs');

// Simulate the analyzer logic
function testAnalyzer() {
    const content = `Software Engineer at Google
2020 - Present

Data Analyst at Microsoft  
2018 - 2020

Bachelor of Science at Stanford University
2014 - 2018`;

    console.log('Testing content:');
    console.log(content);
    console.log('\n--- Testing Line by Line ---');

    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    lines.forEach((line, i) => {
        console.log(`Line ${i + 1}: "${line}"`);
        
        // Test job pattern: "Title at Company"
        const atPattern = /^(.+?)\s+at\s+(.+?)(?:\s*\(|\s*$|•|·)/i;
        const atMatch = line.match(atPattern);
        if (atMatch) {
            const title = atMatch[1].trim();
            const company = atMatch[2].trim();
            console.log(`  -> Found job: "${title}" at "${company}"`);
            
            // Test validation
            const jobWords = ['engineer', 'developer', 'manager', 'analyst', 'consultant'];
            const hasJobWord = jobWords.some(word => title.toLowerCase().includes(word));
            console.log(`  -> Has job word: ${hasJobWord}`);
            console.log(`  -> Title length OK: ${title.length > 3 && title.length < 80}`);
            console.log(`  -> Company length OK: ${company.length > 1 && company.length < 80}`);
        }
        
        // Test education
        const eduWords = ['university', 'college', 'bachelor', 'master'];
        const hasEduWord = eduWords.some(word => line.toLowerCase().includes(word));
        if (hasEduWord) {
            console.log(`  -> Found education: "${line}"`);
        }
        
        console.log('');
    });
}

testAnalyzer();