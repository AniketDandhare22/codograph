// Initialize CodeMirror with C++ as default
const codeEditor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
    mode: "text/x-c++src",
    theme: "dracula",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: true
});
let isSubmitting = false; // Prevent multiple clicks


function toggleTheme() {
    document.body.classList.toggle("light-theme");

    // Save user preference in localStorage
    const theme = document.body.classList.contains("light-theme") ? "light" : "dark";
    localStorage.setItem("theme", theme);
}

// Apply saved theme when page loads
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }
});


// Function to change theme dynamically
document.getElementById("theme-select").addEventListener("change", function () {
    const selectedTheme = this.value;
    codeEditor.setOption("theme", selectedTheme);
});


document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".btn1").addEventListener("click", () => {
        if (isSubmitting) return; // Stop if already submitting
        isSubmitting = true;

        setTimeout(() => {
            visualizeGraph();
            isSubmitting = false; // Allow next submission after delay
        }, 1000); // 1-second delay
    });
});


// Default code snippets
const defaultCode = {
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    python: `# Python Program
def greet():
    print("Hello, World!")

greet()`
};

// Set default code when the page loads
function setDefaultCode() {
    const language = document.getElementById("language-select").value;
    codeEditor.setValue(defaultCode[language]);
}

// Change language and update syntax highlighting
function changeLanguage() {
    setDefaultCode();
    const language = document.getElementById("language-select").value;
    const mode = {
        cpp: "text/x-c++src",
        java: "text/x-java",
        python: "text/x-python"
    };
    codeEditor.setOption("mode", mode[language]);
}

// Run code and display output
async function runCode() {
    const userCode = codeEditor.getValue();
    const outputDiv = document.getElementById("output");
    const language = document.getElementById("language-select").value;

    outputDiv.textContent = "Running...";

    try {
        if (language === "python") {
            // Execute Python using Pyodide in the browser
            const pyodide = await loadPyodideInstance();
            let result = await pyodide.runPythonAsync(userCode);
            outputDiv.textContent = result;
        } else {
            // Execute C++ or Java using Judge0 API
            const languageId = { cpp: 52, java: 62 }[language]; // 52 -> C++, 62 -> Java
            const output = await executeWithJudge0(userCode, languageId);
            outputDiv.innerHTML = output.replace(/\n/g, "<br>");

        }
    } catch (err) {
        outputDiv.textContent = `Error: ${err.message}`;
    }
}

// Load Pyodide correctly
async function loadPyodideInstance() {
    if (!window.pyodide) {
        window.pyodide = await loadPyodide();
    }
    return window.pyodide;
}

// Execute C++ or Java using Judge0 API
async function executeWithJudge0(code, languageId) {
    const API_URL = "https://judge0-ce.p.rapidapi.com/submissions/";
    const API_KEY = "bf63fc9bb2msh7fa6287301a2014p171d6bjsn1d6968144681"; // Replace with your Judge0 API key

    try {
        // Step 1: Submit Code for Execution
        const submissionResponse = await fetch(API_URL + "?base64_encoded=false", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": API_KEY,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
            body: JSON.stringify({
                source_code: code,
                language_id: languageId,
                stdin: "",
            }),
        });

        // Check if API returned a valid response
        if (!submissionResponse.ok) {
            throw new Error(`Failed to submit code. Status: ${submissionResponse.status}`);
        }

        // Parse JSON response safely
        let submissionResult;
        try {
            submissionResult = await submissionResponse.json();
        } catch (jsonError) {
            throw new Error("Invalid JSON response from API (Step 1).");
        }

        // Extract token
        const token = submissionResult.token;
        if (!token) {
            throw new Error("Failed to get execution token from API.");
        }

        // Step 2: Fetch Execution Result (Retries up to 10 times)
        let output = "Processing...";
        for (let i = 0; i < 10; i++) { // Retry for 20 seconds (2s delay each)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const resultResponse = await fetch(API_URL + token + "?base64_encoded=false", {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": API_KEY,
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                },
            });

            if (!resultResponse.ok) {
                console.error(`Attempt ${i + 1}: Failed to fetch execution result (Status: ${resultResponse.status})`);
                continue; // Try again
            }

            let resultData;
            try {
                resultData = await resultResponse.json();
            } catch (jsonError) {
                console.error("Invalid JSON response from API (Step 2).");
                continue; // Retry fetching
            }

            // Check if execution is complete
            if (resultData.status && resultData.status.id > 2) { 
                output = resultData.stdout || resultData.stderr || "Execution failed.";
                break;
            }
        }

        return output;
    } catch (error) {
        console.error("Execution Error:", error);
        return `Error: ${error.message}`;
    }
}

// Call setDefaultCode when the page loads
window.onload = setDefaultCode;
let clockInterval;
let startTime = 0;
let isClockRunning = false; // Track if the clock is running

function toggleClock() {
    if (isClockRunning) {
        clearInterval(clockInterval);
    } else {
        clockInterval = setInterval(updateClock, 1000);
    }
    isClockRunning = !isClockRunning; // Toggle the state
}

function updateClock() {
    startTime++;
    let hours = Math.floor(startTime / 3600);
    let minutes = Math.floor((startTime % 3600) / 60);
    let seconds = startTime % 60;
    document.getElementById('clock').innerText =
        String(hours).padStart(2, '0') + ' : ' +
        String(minutes).padStart(2, '0') + ' : ' +
        String(seconds).padStart(2, '0');
}

function resetClock() {
    clearInterval(clockInterval);
    startTime = 0;
    document.getElementById('clock').innerText = '00 : 00 : 00';
    isClockRunning = false;
}

// Start the clock initially
window.onload = function () {
    toggleClock();
};


document.addEventListener("DOMContentLoaded", function () {
    // Horizontal Resizer (Graph Editor ↔ Terminal)
    const horizontalResizer = document.getElementById("visual-resizer");
    const graphEditor = document.getElementById("visual-output"); 
    const terminal = document.getElementById("terminal");

    // Vertical Resizer (Between Code Editor and Right Panel)
    const verticalResizer = document.getElementById("editor-resizer");
    const codeEditor = document.getElementById("editor");
    const rightPanel = document.getElementById("right-panel");
    const container = document.querySelector(".container"); // Main container

    let isResizingHorizontal = false;
    let isResizingVertical = false;

    // Horizontal Resize Logic
    horizontalResizer.addEventListener("mousedown", function (e) {
        e.preventDefault();
        isResizingHorizontal = true;
        document.addEventListener("mousemove", resizeHorizontal);
        document.addEventListener("mouseup", stopResizeHorizontal);
    });

    function resizeHorizontal(e) {
        if (!isResizingHorizontal) return;

        let containerRect = rightPanel.getBoundingClientRect();
        let newHeight = e.clientY - containerRect.top;

        let minSize = 50;
        let maxSize = rightPanel.clientHeight - minSize;
        if (newHeight < minSize || newHeight > maxSize) return;

        graphEditor.style.height = `${newHeight}px`;
        terminal.style.height = `${rightPanel.clientHeight - newHeight - horizontalResizer.offsetHeight}px`;

        horizontalResizer.style.top = `${newHeight}px`;
    }

    function stopResizeHorizontal() {
        isResizingHorizontal = false;
        document.removeEventListener("mousemove", resizeHorizontal);
        document.removeEventListener("mouseup", stopResizeHorizontal);
    }

    // Vertical Resize Logic (Now Working Correctly)
    verticalResizer.addEventListener("mousedown", function (e) {
        e.preventDefault();
        isResizingVertical = true;
        document.addEventListener("mousemove", resizeVertical);
        document.addEventListener("mouseup", stopResizeVertical);
    });

    function resizeVertical(e) {
        if (!isResizingVertical) return;

        let containerWidth = container.clientWidth;
        let newEditorWidth = e.clientX - container.offsetLeft;

        let minSize = 200; // Minimum width for the editor
        let maxSize = containerWidth - minSize;

        if (newEditorWidth < minSize || newEditorWidth > maxSize) return;

        codeEditor.style.flex = `0 0 ${newEditorWidth}px`; // Set editor width
        rightPanel.style.flex = `1`; // Right panel takes remaining space
    }

    function stopResizeVertical() {
        isResizingVertical = false;
        document.removeEventListener("mousemove", resizeVertical);
        document.removeEventListener("mouseup", stopResizeVertical);
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const accountDiv = document.querySelector("#a_image");
    const popup = document.getElementById("account-popup");
    const mainContent = document.getElementById("main-content");

    // Show Popup & Blur Only Main Content
    accountDiv.addEventListener("click", function () {
        popup.classList.add("show");
        mainContent.classList.add("blur");
    });

    // Close Popup & Remove Blur
    function closePopup() {
        popup.classList.remove("show");
        mainContent.classList.remove("blur");
    }

    // Logout Function
    function logout() {
        alert("Logged out successfully!");
        closePopup();
    }

    // Make functions globally accessible
    window.closePopup = closePopup;
    window.logout = logout;
});
