from grpc_reflection.v1alpha import reflection
import concurrent.futures
import grpc
import chromadb
from chromadb.utils import embedding_functions

import java_python_product_analysist_pb2_grpc
import java_python_product_analysist_pb2


CHROMA_DATA_PATH = "./chroma_db_data"

ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="BAAI/bge-m3"
)

chroma_client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)
collection = chroma_client.get_collection(
    name="recycling_db",
    embedding_function=ef
)

class SubmitPythonAnalystServicer(java_python_product_analysist_pb2_grpc.SubmitPythonAnalystServicer):
    def ClassifyProduct(self, request, context):
        product_name = request.productName.strip()

        if not product_name:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("상품명을 작성해서 주세요")
            return java_python_product_analysist_pb2.ProductResponse()

        try:
            results = collection.query(
                query_texts=[product_name],
                n_results=1
            )

            if not results["metadatas"] or not results["metadatas"][0]:
                return java_python_product_analysist_pb2.ProductResponse(
                    material=["매칭 정보 없음"],
                    description="매칭 정보 없음"
                )

            top_metadata= results["metadatas"][0][0]

            raw_material = top_metadata.get("material","")
            materials_list = [m.strip() for m in raw_material.split(",") if m.strip()]
            description_text = top_metadata.get("how_to_dispose","")

            return java_python_product_analysist_pb2.ProductResponse(
                material=materials_list,
                description=description_text
            )

        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"ChromaDB Query Error: {str(e)}")
            return java_python_product_analysist_pb2.ProductResponse()

def serve():
    server = grpc.server(concurrent.futures.ThreadPoolExecutor(max_workers=10))
    java_python_product_analysist_pb2_grpc.add_SubmitPythonAnalystServicer_to_server(
        SubmitPythonAnalystServicer(), server
    )

    SERVICE_NAMES = (
        java_python_product_analysist_pb2.DESCRIPTOR.services_by_name["SubmitPythonAnalyst"].full_name,
        reflection.SERVICE_NAME
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)

    server.add_insecure_port('[::]:50051')
    print("gRPC Server listening on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve()