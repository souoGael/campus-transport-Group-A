export default function html2canvas() {
    return new Promise((resolve) => {
      resolve(document.createElement("canvas")); // Return a mock canvas element
    });
  }
  