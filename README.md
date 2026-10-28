# kyc
This is a know your customer(KYC) software with heavy and strong guardrails following industry standard requirements


# Introduction

The KYC software will perform unique checks to confirm the system takes accuracy as the first priority. also the system will allow management to regulate it in terms of risks. there is Low, Medium, High. how it will perform to the end user, will go in accordance to which kind of regulation. this software will enable firms, industries, businesses know who they are dealing with in the other end. and if its risky or not. and also to promote transparency.

## Features

> Backend - The backend was the one that was started out as the first one here is its current features:

- **Sessions** - Following the project's document, User needs to give consent of the data we are going to take so after user agrees, everything will be tracked through a session that will be issued after consent.

- **Customer identification module** - After a session is initiated, the user inputs his/her basic information and the info provided should be accurate since that will be compared again other shared data after-wards. the basic info includes:

        - {

            full_name: string
            date_of_birth: string // YYYY-MM-DD
            nationality: string
            address: string
            phone: string
            email: string
            id_number: string

        -  }

> Frontend - 


## Prerequisites & Tech Stack

The project runs on **Node js** via **npm** for Backend and **React** for frontend and has to be the latest version

> Tech stack - Backend

`Node js(typescript),  Fastify`

> Tech stack - Frontend

`React(typescript)`


## Getting Started

Cloning the repository and running the backend

        git clone git@github.com:genmarstech/kyc.git

        cd /backend 

Install packages

        npm install

Configure environment variables

        cp .env.example .env


Run the application

        npm run dev

**Available API endpoints**

| Method | Endpoint | Description
| ----------- | ----------- | ----------- |
| Get | /sys-info | checking the health of the application
| post | /sessions/qr | creating sessions for starting the process
| CRUD | /identity | users adding their basic info

>endpoints will be updated as the app progresses

---

Licensed under the [GNU License](LICENSE).




