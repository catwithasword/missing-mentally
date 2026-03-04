To ApAp - The team lead of Missing Mentally,

Developed on Python 3.11.9

Install requirements
`pip install requirements.txt`

Run
`python ./embedder.py` to initialize db, then
`streamlit run ./POC_main.py`

Available queries with current imageset I totally did not sail the seven seas for are:
Phone/Book/Car key/Guitar/Key/Music player/Glasses/Pill/Bicycle

Note that its accuracy may look stupid -- that's because it is.

Also,
 
if you look in `embedder.py`, you will find variables like 
- `db_path` (you can leave this as is)
- `image_folder_path` (this should be your image database folder) (and if you make change to this `embedder.py` should be ran again via `python ./embedder.py` to update the embedding db)