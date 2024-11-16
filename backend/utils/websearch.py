# websearch.py
import requests
from bs4 import BeautifulSoup
import time

def search_web(query):
    # Simulation de recherche web sans API
    # Dans une version réelle, il faudrait implémenter un vrai web scraping
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    search_url = f"https://html.duckduckgo.com/html/?q={query}"
    try:
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        results = soup.find_all('div', class_='result__body')
        
        combined_results = ""
        for result in results[:3]:
            text = result.get_text()
            combined_results += text + "\n"
        
        return combined_results
    except Exception as e:
        return None