document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".btn1").addEventListener("click", () => {
        setTimeout(visualizeGraph, 10); // Delay execution to ensure latest value
    });
});

function visualizeGraph() {
    
    const code = codeEditor.getValue();; // Fetch updated value
    console.log("Updated Code Input:", code); // Debugging log

    const detectedType = detectCodeType(code);
    console.log("Detected Type:", detectedType); // Debugging log

    document.getElementById("graph-output").innerText = detectedType ? `Detected: ${detectedType}` : "No Structure Detected";
}

function detectCodeType(code) {
    if (/\b(graph|adjacency|edges|nodes|vertex|dfs|bfs)\b/.test(code)) return "Graph";
    if (/\b(vector|std::vector|arraylist|list\s*\[)/.test(code)) return "Vector/Array";
    if (/\b(linked\s*list|node\s*\*|class\s*node|struct\s*node)\b/.test(code)) return "Linked List";
    if (/\b(stack|push|pop)\b/.test(code)) return "Stack";
    if (/\b(queue|enqueue|dequeue)\b/.test(code)) return "Queue";
    if (/\b(sort|quicksort|mergesort|bubblesort|heapsort)\b/.test(code)) return "Sorting Algorithm";
    if (/\b(tree|binary\s*tree|bst|treenode)\b/.test(code)) return "Tree";

    return "General Code";
}
