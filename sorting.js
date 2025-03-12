document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("graph-output");
    const ctx = canvas.getContext("2d");
    let data = [];
    
    function drawBars(arr) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let barWidth = canvas.width / arr.length;
        arr.forEach((value, index) => {
            ctx.fillStyle = "blue";
            ctx.fillRect(index * barWidth, canvas.height - value, barWidth - 2, value);
        });
    }

    function detectSortAlgorithm(code) {
        if (/mergeSort|mergesort/i.test(code)) return "merge";
        if (/quickSort|quicksort/i.test(code)) return "quick";
        if (/insertionSort|insertionsort/i.test(code)) return "insertion";
        return null;
    }

    function animateSorting(steps) {
        let index = 0;
        function step() {
            if (index < steps.length) {
                drawBars(steps[index]);
                index++;
                requestAnimationFrame(step);
            }
        }
        step();
    }

    function mergeSort(arr) {
        let steps = [];
        function merge(left, right) {
            let sortedArray = [];
            while (left.length && right.length) {
                sortedArray.push(left[0] < right[0] ? left.shift() : right.shift());
            }
            return [...sortedArray, ...left, ...right];
        }
        function sort(arr) {
            if (arr.length < 2) return arr;
            let mid = Math.floor(arr.length / 2);
            let left = sort(arr.slice(0, mid));
            let right = sort(arr.slice(mid));
            let merged = merge(left, right);
            steps.push([...merged]);
            return merged;
        }
        sort(arr);
        return steps;
    }
    
    function quickSort(arr) {
        let steps = [];
        function sort(arr) {
            if (arr.length < 2) return arr;
            let pivot = arr[0];
            let left = arr.slice(1).filter(x => x < pivot);
            let right = arr.slice(1).filter(x => x >= pivot);
            let sorted = [...sort(left), pivot, ...sort(right)];
            steps.push([...sorted]);
            return sorted;
        }
        sort(arr);
        return steps;
    }

    function insertionSort(arr) {
        let steps = [];
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
            steps.push([...arr]);
        }
        return steps;
    }

    document.getElementById("runCode").addEventListener("click", function () {
        let code = document.getElementById("code-editor").value;
        let detectedSort = detectSortAlgorithm(code);
        if (!detectedSort) {
            alert("No sorting algorithm detected!");
            return;
        }
        
        data = Array.from({ length: 10 }, () => Math.floor(Math.random() * canvas.height));
        drawBars(data);
        
        let steps;
        if (detectedSort === "merge") steps = mergeSort([...data]);
        if (detectedSort === "quick") steps = quickSort([...data]);
        if (detectedSort === "insertion") steps = insertionSort([...data]);
        
        animateSorting(steps);
    });
});