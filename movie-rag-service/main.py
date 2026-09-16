# main.py
from rag.indexer import seed_database_and_vectors
from agents.orchestrator import run_agent_loop

def main():
    print("Initializing Movie Chat AI Service components...")
    seed_database_and_vectors()

    print("\n--- Service Ready. Type your inquiry below (Type 'exit' to quit) ---")
    while True:
        try:
            user_msg = input("\nYou: ")
            if user_msg.strip().lower() == "exit":
                break

            if not user_msg.strip():
                continue

            ai_reply = run_agent_loop(user_msg)
            print(f"AI: {ai_reply}")
        except Exception as e:
            print(f"System Error Encountered: {e}")

if __name__ == "__main__":
    main()
