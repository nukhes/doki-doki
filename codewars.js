// 31st July - Mumbling function
function accum(str) {
    let result = str[0].toUpperCase();
    
    function buildSegment(char, count) {
        let segment = "-" + char.toUpperCase();
        for (let i = 1; i < count; i++) {
            segment += char.toLowerCase();
        }
        return segment;
    }

    for (let i = 1; i < str.length; i++) {
        const char = str[i];
        result += buildSegment(char, i + 1);
    }
    return result;
}

// 1st August - Get Middle Character
function getMiddle(s) {
    const middle = Math.floor(s.length / 2);
    return s.length % 2 === 0 
        ? s.slice(middle - 1, middle + 1) 
        : s[middle];
}

// 3rd August - Multiples of 3 or 5
function sumMultiples(number) {
    let sum = 0;
    for (let i = 0; i < number; i++) {
        if (i % 3 === 0 || i % 5 === 0) sum += i;
    }
    return sum;
}

// 5th August - Format Names List
function formatNamesList(names) {
    let result = "";
    for (let i = 0; i < names.length; i++) {
        result += names[i].name;
        if (i === names.length - 1) return result;
        result += (i === names.length - 2) ? " & " : ", ";
    }
    return result;
}

// 10th August - Disemvowel
function disemvowel(str) {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    let result = "";
    for (const char of str) {
        if (!vowels.has(char.toLowerCase())) {
            result += char;
        }
    }
    return result;
}

// 11th August - Isogram Check
function isIsogram(str) {
    if (str.length <= 1) return true;
    const seenChars = {};
    const lowerStr = str.toLowerCase();
    for (const char of lowerStr) {
        if (seenChars[char]) return false;
        seenChars[char] = true;
    }
    return true;
}
