from grpc_reflection.v1alpha import reflection
import concurrent.futures
import grpc
import re
import csv
from pathlib import Path

import java_python_product_analysist_pb2_grpc
import java_python_product_analysist_pb2

from hybride_search_engine import hybrid_search_rrf, rating_hybrid_score


BASE = Path(__file__).resolve().parent
FAILED_PRODUCT = BASE.parent / "datas" / "check_ai_review.csv"

def csv_add_product_name(product_name: str):
    file_exists = FAILED_PRODUCT.exists()
    with open(FAILED_PRODUCT, mode="a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow("Product_Title")
        writer.writerow(product_name)

class SubmitPythonAnalystServicer(java_python_product_analysist_pb2_grpc.SubmitPythonAnalystServicer):
    def ClassifyProduct(self, request, context):
        product_name = re.sub(r'\(.*?\)|\[.*?\]', '',request.productName).strip()

        if not product_name:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("상품명을 다시 확인해 주세요")
            return java_python_product_analysist_pb2.ProductResponse()

        try:

            search_result = hybrid_search_rrf(product_name)
            top_metadata = search_result.get("metadata")

            if not top_metadata:
                csv_add_product_name(product_name)
                return java_python_product_analysist_pb2.ProductResponse(
                    material=["매칭 정보 없음"],
                    description="매칭 정보 없음"
                )

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

    def ListProducts(self, request, context):
        product_name = re.sub(r'\(.*?\)|\[.*?\]', '', request.productName).strip()

        if not product_name:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("상품명을 다시 확인해 주세요.")
            return java_python_product_analysist_pb2.ProductListResponse()

        try:
            recommand_results = rating_hybrid_score(product_name)

            product_response = []

            for item in recommand_results:
                top_metadata = item.get("metadata", {})
                raw_material = top_metadata.get("material","")
                material_list = [m.strip() for m in raw_material.split(",") if m.strip()]
                description_text = top_metadata.get("how_to_dispose", "")

                product_response.append(
                    java_python_product_analysist_pb2.ProductResponse(
                        material=material_list,
                        description=description_text
                    )
                )

            return java_python_product_analysist_pb2.ProductListResponse(
                products=product_response
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"ChromaDB Query Error: {str(e)}")
            return java_python_product_analysist_pb2.ProductListResponse()


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