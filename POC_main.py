import streamlit as st
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader
import os

db_path = "./db/"

# setup Chroma in-memory, for easy prototyping. Can add persistence easily!
client = chromadb.PersistentClient(path=db_path)

# Create collection. get_collection, get_or_create_collection, delete_collection also available!
collection = client.get_or_create_collection("test_images")

embedding_function = OpenCLIPEmbeddingFunction()
data_loader = ImageLoader()

collection = client.get_or_create_collection(
    name='multimodal_collection3',
    embedding_function=embedding_function,
    data_loader=data_loader
)


st.title("Vehicle Image Search Engine")

# Search bar
query = st.text_input("Enter your search query:")
parent_path = r"./test_images" #add your image folder path here
if st.button("Search"):
    results = collection.query(query_texts=[query], n_results=10,include=["distances"])
    print(results)

    image_tuple = [(image_id, distance) for image_id, distance in zip(results['ids'][0], results['distances'][0]) ]

    image_tuple = sorted(image_tuple, key=lambda x: x[1])

    for image_id, distance in image_tuple:
        image_path = os.path.join(parent_path, image_id)

        st.image(image_path, caption=os.path.basename(image_path))

        st.write(f"Distance: {distance}")