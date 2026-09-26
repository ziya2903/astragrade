# AstraGrade 🧅 — AI Onion Quality Assessment & Grading System
### Built by Team KisanAstra

> **A transparent, unbiased AI computer vision tool for agricultural procurement centres (APMCs/Mandis) to eliminate human inspector bias and disputes between farmers and procurement staff.**

---

## 📌 Problem & Context
At onion procurement hubs across India (such as Nashik, Lasalgaon, Pimpalgaon), onion grading has historically been conducted manually by human inspectors. This manual inspection process suffers from:
1. **Subjectivity & Human Inconsistency:** Different inspectors and centres grade identical produce differently.
2. **Farmer Disputes:** Farmers frequently feel shortchanged or suspect biased grading when their lot is classified as Under-Rated Stock (URS).
3. **Lack of Verifiable Records:** Paper grading slips lack reproducible visual evidence or objective confidence scores.

**AstraGrade** solves this by putting an AI-powered image classification model in the hands of field staff and farmers. Every batch is evaluated instantly in the browser using a pre-trained **Google Teachable Machine (TensorFlow.js)** model, generating an unalterable, timestamped **Digital Quality Slip** with PDF export.

---

## 🚀 Key Features

### 1. Zero-Friction Authentication (Low Digital Literacy UI)
- **Farmer / Centre Staff Login:** Mobile number + 4-digit OTP. Accepts any 4-digit code (pre-filled with `1234` for rapid demo evaluation). Large buttons, high contrast, minimal text.
- **Central Admin / Ministry Login:** `admin@kisanastra.gov.in` / `admin123` for central oversight across all regional mandis.

### 2. Live Onion Scanning & Multi-Angle Batch Aggregation (Core AI)
- **Direct Camera Capture:** Uses device camera (mobile rear/front camera or laptop webcam) with reticle targeting.
- **Gallery Upload:** Allows uploading one or multiple photos from phone/computer.
- **Built-in Demo Specimens:** Instant 1-click loading for test onions (Grade A, Rotten, Sprouted, Undersized, and a 5-sample mixed batch) for panel demos without physical onions.
- **Client-Side Real-Time Inference:** Powered by Google Teachable Machine TFJS model. Images never need to leave the client device, enabling instantaneous grading without server lag.
- **Multi-Sample Batch Aggregation:** Evaluates multiple onions from a batch/bag (e.g. 5–10 samples) and computes:
  $$\text{Overall Grade A \%} = \frac{1}{N}\sum \text{Grade A}_i$$
  $$\text{Overall URS \%} = \frac{1}{N}\sum (\text{Rotten}_i + \text{Sprouted}_i + \text{Undersized}_i)$$
- **Chart.js Visual Distribution:** Interactive Doughnut chart showing the exact class proportions.

### 3. Digital Report Generation & PDF Certificate
- Generates an official **AstraGrade Quality Certificate** containing:
  - Procurement Centre Name & Code
  - Unique Assessment ID (`ASTRA-YYYYMMDD-XXX`)
  - Farmer Name, Mobile Number, and Lot Number
  - Sample Count & Verdict Line: `Grade A Approved` ($\ge 60\%$) or `URS Category`
  - Parameter breakdown matrix (Grade A, Rotten, Sprouted, Undersized)
  - Legal Transparency & Fair Pricing Guarantee
- **1-Click PDF Download:** Uses `jsPDF` and `jspdf-autotable` to produce an official print-ready certificate.
- **Automatic Storage:** Saves directly to the backend database / Firestore.

### 4. Audit History & Central Admin Dashboard
- **History View:** Complete searchable log of all past assessments, filterable by Grade A vs URS, with instant PDF re-downloads.
- **Admin Oversight View:** Displays average Grade A % across all centres, total batches graded, and automatically flags procurement centres with abnormally high rejection/URS rates for audit.

---

## 🧠 AI Model Architecture

The application uses Google Teachable Machine's image classification model trained on onion quality classes:

| Class | Description | Standard Threshold |
|---|---|---|
| **GradeA** | Healthy, firm copper-red skin, dry neck, $\ge 45\text{ mm}$ diameter | $\ge 60.0\%$ for batch approval |
| **Rotten** | Soft neck rot, Aspergillus niger black mold, watery scales | $\le 10.0\%$ tolerated |
| **Sprouted** | Internal green vegetative shoot emergence | $\le 15.0\%$ tolerated |
| **Undersized** | Immature bulb ($< 45\text{ mm}$ diameter) | $\le 15.0\%$ tolerated |

- **Model Base URL:** `https://teachablemachine.withgoogle.com/models/bIzzGa24O/`
- **Model JSON:** `https://teachablemachine.withgoogle.com/models/bIzzGa24O/model.json`
- **Metadata JSON:** `https://teachablemachine.withgoogle.com/models/bIzzGa24O/metadata.json`
- **Note:** The model is hosted by Google. **No local model weight files are required.** The application streams the model directly via the `@teachablemachine/image` and `@tensorflow/tfjs` APIs.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Tailwind CSS v4, Lucide Icons, Chart.js, React-ChartJS-2, jsPDF, jspdf-autotable, Canvas-Confetti, Vite.
- **AI Engine:** Google Teachable Machine Image Library (`@teachablemachine/image` & `@tensorflow/tfjs`).
- **Backend:** Node.js, Express, CORS.
- **Database:** Firebase Firestore integration (with automatic persistent local JSON fallback for offline/zero-setup operation).

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js (v18 or higher recommended; tested on v26)
- npm (v9+)

### Installation
Run the following from the project root (`KisanAstra/`):

```bash
# 1. Install all dependencies (both backend server and frontend client)
npm run install:all
```

*(Or navigate into `server` and `client` individually and run `npm install`)*

### Starting the Application
You can run both the Express backend and React frontend concurrently:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 🧪 Step-by-Step Live Demo Scenario (For Panel Presentation)

1. **Login (Farmer / Staff):**
   - Go to `http://localhost:5173`.
   - Select procurement centre (e.g. *Nashik APMC Main Yard*).
   - Click **"Quick 1-Click Demo Login"** (or enter any phone number and OTP `1234`).
2. **Main Dashboard:**
   - Note the prominent, high-contrast **"Check Onion Quality"** button and recent scan cards.
   - Click **"Check Onion Quality"** / **"Start Scan"**.
3. **Multi-Sample Quality Check:**
   - Click **"Demo Onion Samples"** $\to$ Click **"Load 5-Sample Mixed Onion Batch"** (or use device camera / upload real onion photos).
   - Watch the AI evaluate the specimens in real-time, showing confidence percentages for all 4 classes.
   - Tap individual thumbnail cards to see sample-specific scores.
   - Observe the aggregated summary banner: **Overall Grade A % vs Overall URS %** alongside the interactive **Chart.js Doughnut chart**.
4. **Generate Digital Report:**
   - Click **"Generate Official Digital Report"** (celebratory confetti fires if Grade A passes!).
   - Inspect the official digital grading slip with certificate ID, breakdown table, and dispute prevention guarantee.
   - Click **"Download Official PDF"** $\to$ Open the exported PDF to show the clean procurement slip.
5. **Switch to Admin Oversight View:**
   - In the navigation bar, click **"Admin View"** (or sign in as `admin@kisanastra.gov.in` / `admin123`).
   - Review multi-centre metrics, average Grade A consistency, and flagged mandi centres.

---

## 👥 Built by
**Team KisanAstra** • Empowering farmers and Mandi officers through transparent AI technology.
