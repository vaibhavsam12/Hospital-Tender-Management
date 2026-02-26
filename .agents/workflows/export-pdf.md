---
description: how to generate and manage tender comparison PDF reports
---

# Tender PDF Export Workflow

This workflow describes how to generate, customize, and verify the PDF comparison reports for hospital tenders.

## 1. Generating a Report (User Flow)
1. Navigate to the **Tenders** catalog from the sidebar.
2. Select a specific tender to view its details.
3. Ensure there is at least **one bid** submitted for the tender.
4. Click the **[Export Report]** button located in the top-right header section.
5. The PDF will be generated client-side and automatically downloaded as `Tender_Report_<ID>.pdf`.

## 2. Technical Implementation Details
The PDF generation is handled in the frontend using `jsPDF` and `jspdf-autotable`.

- **Component**: `tender-detail.component.ts`
- **Method**: `exportPDF()`
- **Dependencies**: 
  - `jspdf`: Core PDF generation.
  - `jspdf-autotable`: Plugin for rendering the bids comparison table.

### Report Structure:
- **Header**: Styled with TenderMed Pro branding (Cyan #00ACC1).
- **Metadata**: Includes generation timestamp and tender details (Hospital, Budget, Status).
- **Comparison Table**: Lists all vendors, their quotes, L1 status, and winning status.

## 3. Customizing the Report
To modify the report layout or colors, edit the `exportPDF()` method in `tender-detail.component.ts`:

- **Change Brand Color**: Update `doc.setTextColor(0, 172, 193)` and `fillColor: [0, 172, 193]`.
- **Add Columns**: Update the `tableData` mapping and the `head` array in the `autoTable` configuration.
- **Font Sizes**: Adjust `doc.setFontSize(N)` before adding text elements.

## 4. Verification & Testing
To verify the PDF functionality:
1. Log in as an **Admin** or **Officer**.
2. Submit test bids for a sample tender if none exist.
3. Click **Export Report** and open the resulting PDF.
4. Verify that:
   - Currency is formatted correctly in INR Lakhs.
   - The L1 (Lowest Bidder) is correctly identified in the table.
   - The document header displays the correct Tender Title and Hospital.
