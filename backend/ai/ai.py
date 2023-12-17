import time

from langchain.llms import CTransformers
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from googletrans import Translator

translator = Translator()

template = lambda prompt: '''
[INST] <<SYS>>
'''+prompt+'''
<</SYS>>

Chat History:
{chat_history}

User: {text}[/INST]
'''
rules = '''
Your name is Eli. You are a helpful doctor assistant, you always only answer for the assistant then you stop. read the chat history to get context.
I want you to act as a virtual doctor. I will describe my symptoms and you will provide a diagnosis and treatment plan. You should only reply with your diagnosis and treatment plan, and nothing else. Do not write explanations. 
Outline a detailed treatment plan.
Example chat:
User: Hello! help me pls. what to do if your throat hurts?
Eli: You should drink warm water. ((What to do if you have a sore throat))
'''

template = lambda prompt: '''
'''+prompt+'''
Chat history:
{chat_history}
{text}
Eli:
'''


class Ai:
    llm: CTransformers = None
    prompt = None
    def __init__(self, path: str, rules: str=rules):
        #callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
        self.rules = rules
        self.prompt = template(self.rules)

        self.memory = ConversationBufferMemory(memory_key="chat_history")
        self.llm = CTransformers(
            model=path,
            model_type='llama',
            verbose=True,
            config={"max_new_tokens": 256, "context_length":2048, "stop": ["user:"],
                    'gpu_layers': 40, 'threads': 10,
                    }#'n_gpu_layers':32,'n_threads': 10  'batch_size': 10,
        )

    def translate(self, text: str, org: str, to: str) -> str:
        return translator.translate(text, dest=to, src=org).text

    def setPrompt(self, prompt: str) -> None:
        self.rules = prompt
        self.prompt = template(prompt)

    def getPrompt(self):
        return self.rules

    def clear(self):
        self.memory.clear()

    def generate(self, quest) -> str:
        # self.prompt += f"""\n### User: {quest}\n"""
        print("Генерация...", end="\r")

        # if self.vision_mode:
        #     result = self.vision(self.vision_image, quest.replace(" ", ""), prompt=self.prompt)
        #     self.prompt = self.prompt.replace('{user}',result)
        #     return

        self.clear()

        prompt = PromptTemplate(
            input_variables=["text","chat_history"],
            template=self.prompt
        )
        llmchain = LLMChain(llm=self.llm, prompt=prompt, memory=self.memory)
        quest_en = self.translate(quest, org='ru', to="en")
        start_time = time.time()  # Засекаем начальное время
        text = llmchain.predict(text=quest_en)

        end_time = time.time()  # Засекаем конечное время
        elapsed_time = end_time - start_time  # Вычисляем время выполнения
        minutes = int(elapsed_time // 60)  # Количество прошедших минут
        seconds = int(elapsed_time % 60)  # Количество прошедших секунд

        text += f"\n\nВремя генерации: {minutes} минут {seconds} секунд."  # Добавляем информацию о времени выполнения в конец строки text

        text = self.translate(text, org='en', to="ru")
        print('jsonnnn',self.memory.json())

        return text

if __name__ == '__main__':
    print(translator.translate('приве.', dest='en', src="ru").text)
    ai = Ai("C:/Users/Egor/Documents/GitHub/Telegram-RP-AI-Bot/models/wizardlm-1.0-uncensored-llama2-13b.Q4_K_M.gguf") #models/llama-2-7b-chat.ggmlv3.q4_1.bin
    while True:
        text = input("Вы: ")
        result = ai.generate(text)
        print("Эли:", result)