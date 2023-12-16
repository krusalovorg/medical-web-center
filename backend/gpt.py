import g4f

from g4f.Provider import (
    AItianhu,
    Aichat,
    Bard,
    Bing,
    ChatBase,
    ChatgptAi,
    OpenaiChat,
    Vercel,
    You,
    Yqcloud,
)

chat_history = []

while True:
    text = input("quest: ")
    chat_history.append({"role": "user", "content": text})

    # Set with provider
    response = g4f.ChatCompletion.create(
        model=g4f.models.default,
        messages=chat_history,
        # proxy="http://149.50.134.203:80",
    )

    chat_history.append({"role": "assistant", "content": response})

    print(response)