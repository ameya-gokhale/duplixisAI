"""
Run this on YOUR machine to check what's installed:
  python check_env.py

It prints the exact pip install command you need.
"""
import sys
import subprocess

pkgs = ["transformers", "torch", "tensorflow", "sentence-transformers", "sklearn", "numpy", "pandas"]

print("=== Python environment ===")
print(f"Python: {sys.version}")
print()

for pkg in pkgs:
    try:
        mod = __import__(pkg.replace("-", "_"))
        ver = getattr(mod, "__version__", "unknown")
        print(f"  ✅ {pkg}=={ver}")
    except ImportError:
        print(f"  ❌ {pkg}  (not installed)")

# Also try pip list for exact versions
print()
print("=== Full pip freeze (relevant) ===")
result = subprocess.run([sys.executable, "-m", "pip", "freeze"], capture_output=True, text=True)
for line in result.stdout.splitlines():
    for pkg in ["transformers", "torch", "tensorflow", "sentence", "sklearn", "scikit", "numpy", "pandas", "tokenizers", "huggingface"]:
        if pkg.lower() in line.lower():
            print(" ", line)
            break
