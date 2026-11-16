
from flask import Flask, request, send_file, jsonify
from io import BytesIO
from collections import Counter
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

app = Flask(__name__)

@app.post("/graficos")
def gerar_graficos():
    dados = request.get_json(silent=True) or {}
    produtos = dados.get("produtos", [])

    if not produtos:
        return jsonify({"erro": "Não existem dados suficientes para gerar gráficos"}), 400

    nome_produto = Counter(
        item.get("nome_produto", "Não informado") for item in produtos
    )
    categorias = Counter(
        item.get("categoria", "Não informado") for item in produtos
    )
    fig, axs = plt.subplots(1, 2, figsize=(12, 5))
    axs[0].bar(nome_produto.keys(), nome_produto.values())
    axs[0].set_title("Produtos")
    axs[0].set_ylabel("Quantidade")
    axs[0].tick_params(axis="x", rotation=30)

    axs[1].bar(categorias.keys(), categorias.values())
    axs[1].set_title("Categorias")
    axs[1].set_ylabel("Quantidade")
    axs[1].tick_params(axis="x", rotation=30)

    fig.tight_layout()
    buffer = BytesIO()
    fig.savefig(buffer, format="png", dpi=150)
    plt.close(fig)
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="image/png",
        as_attachment=False,
        download_name="graficos.png"
    )

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
