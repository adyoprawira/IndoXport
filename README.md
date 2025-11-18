# IndoXport

IndoXport showcases supplier batch creation, simulated quality control checks, a marketplace view, buyer requirement matching, document generation (invoice, COO, health certificate), and a payment-flow simulation. It is built using Python's Django Framework (Backend) and Next.js (Frontend).

## Project Structure

>IndoXport/
>> ├── backend/         # Django API
>>> │    ├── accounts/

>>> │    ├── buyers/

>>> │    ├── config/

>>> │    ├── exporter/

>>> │    └── ...

> ├── frontend/        # Next.js client
>> │    ├── app/

>> │    ├── components/

>> │    ├── lib/

>> │    └── ...
> ├── README.md
> └── ...

## Environment Requirements

### General Requirements

- Python **3.10+**
- Node.js **18+**
- npm or yarn
- Git
- Recommended : **Python virtual environment (venv)**

#### Python Virtual Environment

Assuming that `Python` is installed. Run:

1. Change directory to the root by `cd ~/Desktop/this_project`
2. Run `python -m venv venv`
3. Activate the virtual environment:

    - Windows:
    
        Run `.\venv\Scripts\activate`
    
    - macOS/Linux:

        Run `source venv/bin/activate`

## Installation Instructions

### Clone the Repository

```bash
git clone https://github.com/geordievannese/IndoXport.git
cd indoxport
```

### Backend Setup (Django)

1. Create and activate a virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate # MacOS/Linux
venv\scripts\activate # Windows
```

2. Install dependecies

```bash
pip install -r requirements.txt
```

3. Apply database migrations

```bash
python manage.py migrate
```

4. Run the backend server

```bash
python manage.py runserver
```

Backend will run on: http://localhost:8000

### Frontend Setup (Next.js)

1. Install dependencies

```bash
cd ..\frontend
npm install
```

2. Run the frontend dev server

```bash
npm run dev
```

Frontend will run on http://localhost:3000

### Running the Entire Application

1. Run Django backend 

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

2. Run Next.js frontend

```bash
cd frontend
npm run dev
```

Open in browser http://localhost:3000

## MVP Functional Overview

### Supplier Dashboard

- Create & manage product batches
- Run simulated quality checks
- Store QC results in a **hash-linked log**

### Marketplace

- Exporters view approved supplier batches

### Buyer Requirement Board

- Structured post with:

    - Contaminant thresholds
    - Volume needs
    - Shipping windows

### Matching Engine

- Exporters browse & match suitable batches
- QC revalidation simulation

### Document Generator

Generates simple PDFs for:

- Commercial invoice
- Certificate of origin
- Health certificate