## 1. Start the Project (Docker)
Make sure you are in the root folder (where docker-compose.yml is located). Docker has to run to be able to start the containers on windows.
When starting the first time you need to build the containers and start them with: 

````
docker compose up --build
````

👉 This will start:
PostGIS database 
Django API container
pgAdmin (Interface for the Database, should be available at localhost:5050 in the browser)

Use PgAdmin to see into the database to see if your operations have been sucessful
Username: vagrant@vagrant.com
password: vagrant

Username and Password can be changed in .env.dev, there all the environment variables are stored.
PgAdmin is like a "window" into the database, when first setting it up it might be that you need to connect to the database first, ask ChatGPT when that happens. Host Name can be found in the env.dev.
PgAdmin in our case has several databases, the database **web** is used for the psycopg stuff and **web_proj** is used for the Django Stuff. 


The database for the Django Project is set in the file .env.dev


The database for the psycopg part is set in scripts/p1/mylib/p1_settings.py


After finishing all tests or the programming the containers can be stopped with

````
docker compose down
````

## 2. Open a Terminal inside the Django Container
First, list running containers:

````
docker ps
````
There you will see the container name for the django api

Then type the following to open a shell INSIDE the container
````
docker exec -it <container_name> bash
````

Example:

````
docker exec -it desweb-djangoapi-1 bash
````

Now you are inside the container and this should show up in the console:

root@container:/usr/src/app#

Alternatively you can use the containers extension for VSCode to start the terminal, its easier but optional, we used it in the class.
It is important to write all console commands inside the container, because there all the environment variables are set there.

## 3. Project Structure 

````
django-api/
│
├── main.py                ← psycopg stuff is used here (RAW SQL stuff, first part of the exercise)
├── scripts/              ← test scripts
│
├── erasmus_valencia/
│   ├── models/           ← Django models (ORM)
│   │   ├── models.py
│
├── manage.py             ← Django CLI

````

## 4. Where is What?

**Psycopg (RAW SQL):**
For Psycopg we used our own classes for each table in the database. First we had to create those tables manually i think, check the pdf to be sure.
So for example if you have the tables Building and Street you will have the classes Building and Street as well in python.
Inside each class there are the respective SQL queries to do update / insert / delete / select. We have the classes Building, POI, and Street for this.
Its located in the scripts folder, each class has its own folder here.

<img width="269" height="161" alt="image" src="https://github.com/user-attachments/assets/1a5a61b1-21d3-4443-b1dc-c0ccaa54f03a" />


**DJANGO Stuff:**
The Django APP is located in this folder: 

<img width="274" height="171" alt="image" src="https://github.com/user-attachments/assets/a55c2e5e-dde0-4626-9e37-2cc01e9e7306" />

The class ````models.py```` contains the tables that are going to be created in the database by django.
Remember: a Model in Django represents a table in the database.

Also there are python classes to create python objects for the respective table here:

<img width="279" height="130" alt="image" src="https://github.com/user-attachments/assets/e594ff60-bef7-4616-b715-8c24adaf2255" />

So far only Buildings is implemented

## 5. Using Psycopg via main.py
The file `main.py` contains the implementation of database operations using **psycopg**, which allows direct interaction with the PostgreSQL/PostGIS database through raw SQL queries. 
This file has to be run like the following from the **Container Console!!!***

Be sure to navigate to the folder ````scripts/p1```` first and start main.py from there!

<img width="324" height="35" alt="image" src="https://github.com/user-attachments/assets/b2adcfa9-3d6b-49e8-91ab-f2a36d0607ae" />


````
python main.py <tableName> <functionName> '<json_data>'
````

So for example if you want to insert a building:

````
python main.py buildings insert '{
    "name": "Library",
    "description": "Main university library",
    "area": 250.5,
    "height": 18.2,
    "category": "Education",
    "visitedAt": "2024-01-01T12:00:00Z",
    "geom": "POLYGON((0 0, 20 0, 20 15, 0 15, 0 0))",
    "epsg": 25830
}'
````

## 6. Using Django via manage.py

Everything in Django has to be executed from the django project folder using the manage.py file. For this Django provides a CLI:

python manage.py <command>

So for example you could use this command from the **Container Console!!!***:

python manage.py runscript test_buildings

At the moment this executes this script:

scripts/test_buildings.py

Which is there to test the functionality of insert / update / delete / select for the buildings table in the database, but right now it only inserts a building.

    
## 7. Psycopg vs Django 
Feature	        psycopg (main.py)	Django ORM
SQL control	    Full	            Abstracted
Difficulty	    Harder	            Easier
Flexibility	    Maximum	            Limited
Use case	    Complex queries	    Standard CRUD

## 8. Typical Workflow
Start containers
Open container terminal
Choose approach:
👉 main.py → raw SQL
👉 manage.py → Django ORM
Run tests / scripts
Check database (pgAdmin or QGIS)

## 9. What You Should Learn

How PostGIS stores geometries
How to use ST_GeomFromText
How to use ST_SnapToGrid
How to prevent invalid geometries
Difference between SQL and ORM
How Django maps models → database tables

**TIP** If you have time, try to create a new django app inside the project to understand what has to be done, as this will give you a good overlook and understanding.


## 10 . What to do in the exam ?

1. Start the Docker Containers
2. Open a Terminal inside the django api container
3. Show how to Insert, Delete, Update, Select with Psycopg, commands for that are in sample_commands.txt
4. Show how to Insert, Delete, Update, Select with Django, commands for that are in sample_commands.txt



# Docker Django API template

It is a Docker template to start Django + DRF + GeoDjango APIs.
It cams with a working example in the buildings app.

# Help

- Clone the repo:

```ruby
    git clone https://github.com/joamona/django-api-template.git
```

- Change to the project folder:
```ruby
    cd django-api-template
```

- Create the pgadmin folders:
```ruby
    Windows: pgadmin_create_folders_windows.bat
    Linux: ./pgadmin_create_folders_linux.sh
```

- Change the ports of the services in the file .env
- Change the secret key, username, database name, etc. in the file .env.dev

- Create the images, containers and start the services:
```ruby
    docker compose up
```
- First time you will get a connection error from the service djangoapi. This is because PostgreSQL is stil
creating the database. Once the PostgreSQL service is OK. Cancel and start the services again.

```ruby
    control + c (cancel)
    docker compose up
```

Everithing should be fine now.

- Check the services:

    - pgadmin: http://localhost:5050
    - geoserver: http://localhost:8080 (Not started by default. You must uncomment the service in docker-compose.yml)
    - Django API: http://localhost:8000/core/hello_world/

# Initialize de database
A superuser must be created and the database must be migrated in order to create de database tables.
This work is done in the script ./initdb.sh. To execute this script:

    - Get into the container *-djangoapi-1 and type:

```ruby
    ./initdb.sh
```

# Start developping
To avoid to install Pyhton and its dependencies in your computer, you can 
use the interpreter in the container. You can achieve this with Visual Studio Code (VS).

- Start the services: docker compose up.
- Open VS.
- Press Ctrl + Shift + p.
- Paste the following: Dev Containers: Attach to Running Container.
- Select the container *-djangoapi-1.
- A new VS code window is started.
- Select the interpreter: Ctrl + Shift + p, and type python select interpreter, and select the interpreter in the container. There are two interpreters. Select the one in 
/usr/local/bib/python. This one is the one that has all the pythoin mackages installed: Django, GeoDjango, etc. In this way VS will help you to code.
- Now, you can modify the source files, and create new Django apps from the VS connected to the container.
- To create a new app, in the terminal, in the VS connected to the container, type: 

    python manage.py startapp mynewapp

# Debugging

RemoteDebug has been configured in the VS project and in settings.py. To stop the execution in a line:

- Put a breackpoint.
- Set, in djangoapi/settings.py, the REMOTE_DEBUG to true.
- Open the Debug window of VS and click Play over the DjangoAPI configuration.
- Ready to debug.

# Installed apps

The project cams with three app:

- core: It has the myLib package, who contains the geoModelSerializer. It is a base class to manage models with geometries. Ii uses geodjango.
- codelist: It is empty. It us thougt to contain all the models who represents codelists of possible values for other models.
- buildings: It contains a model, serializer, and modelViewSet as example of DFR and  geoModelSerializer example. 



