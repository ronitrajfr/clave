"use client";
import { useState, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";

export default function HtmlToPdf() {
  const [url, setUrl] = useState("");
  const [pdfHtml, setPdfHtml] = useState(""); // HTML to be rendered
  const [loading, setLoading] = useState(false); // Loading state
  const resumeRef = useRef(); // Reference to the HTML content for PDF

  // Function to generate the HTML resume
  const generatePdf = async () => {
    setLoading(true); // Set loading to true while fetching data
    try {
      const response = await axios.post("/api/makeresume", {
        url,
      });

      // Log the backend HTML response to check if it's valid
      console.log("Backend HTML response:", response.data.res);

      // Assuming the backend returns HTML in the response
      setPdfHtml(response.data.res); // Set the received HTML to state
      setLoading(false); // Stop loading when data is fetched
    } catch (error) {
      console.error("Error generating PDF:", error);
      setLoading(false); // Stop loading on error
    }
  };

  // Function to download the rendered HTML content as a PDF
  const downloadPdf = () => {
    const element = resumeRef.current;
    html2pdf()
      .from(element)
      .set({
        margin: 1,
        filename: "resume.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  return (
    <div>
      <h1>Generate Resume PDF</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter a URL to fetch data"
      />
      <button onClick={generatePdf}>Generate PDF</button>

      {/* Show loading indicator while fetching HTML */}
      {loading && <p>Loading resume...</p>}

      {/* Render the HTML received from the backend */}
      {pdfHtml && (
        <>
          <div
            ref={resumeRef} // Reference to be used for PDF generation
            className="shadow-xl"
            style={{
              border: "1px solid #000",
            }}
            // Use dangerouslySetInnerHTML for testing the output
            dangerouslySetInnerHTML={{ __html: pdfHtml }}
          />

          {/* Button to download the displayed HTML as a PDF */}
          <button onClick={downloadPdf} style={{ marginTop: "20px" }}>
            Download as PDF
          </button>
        </>
      )}
    </div>
  );
}
