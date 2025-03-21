from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import json

# Setup WebDriver (make sure you have ChromeDriver installed)
service = Service('/usr/local/bin/chromedriver')  # Update this path
options = webdriver.ChromeOptions()
options.add_argument("--headless false")  # Optional: run in background
driver = webdriver.Chrome(service=service, options=options)

for i in range(15,73):
    # Go to the ExamTopics CLF-C02 page
    url = f"https://www.examtopics.com/exams/amazon/aws-certified-cloud-practitioner-clf-c02/view/{i}/"
    driver.get(url)

    # Wait for questions to load
    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CLASS_NAME, "questions-container"))
        )
        print("Questions loaded!")
    except Exception as e:
        print("Timed out waiting for questions to load:", e)


    print("⚠️ Please solve the CAPTCHA in the browser window.")
    input("✅ Press Enter here once you've solved it...")

    # Continue with scraping after CAPTCHA is solved
    print("Continuing automation...")

    # Optional: scroll down to load more questions
    # driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    # time.sleep(3)
    # html = driver.page_source

    # with open('page_source.html', 'w') as f:
    #     f.write(html)

    # Parse the page content
    soup = BeautifulSoup(driver.page_source, "html.parser")
    questions = soup.find_all("div", class_="questions-container")

    with open(f'examview/{i}.html', 'w') as f:
        f.write(str(questions))
    driver.quit()
