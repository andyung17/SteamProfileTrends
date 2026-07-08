import asyncio
import sys
from turtle import title
from howlongtobeatpy import HowLongToBeat
import json

class GameDetailsObject:
    def __init__(
        self, 
        game_id: int, 
        game_name: str, 
        main_story: str, 
        completionist: str, 
        game_image_url: str
    ):
        self.game_id = game_id
        self.game_name = game_name
        self.main_story = main_story
        self.completionist = completionist
        self.game_image_url = game_image_url

    @classmethod
    def from_hltb_entry(cls, entry):

        return cls(
            game_id=getattr(entry, 'game_id', None),
            game_name=getattr(entry, 'game_name', 'Unknown Game'),
            main_story=getattr(entry, 'main_story', 'N/A'),
            completionist=getattr(entry, 'completionist', 'N/A'),
            game_image_url=getattr(entry, 'game_image_url', '')
        )

    def to_dict(self) -> dict:

        return {
            "game_id": self.game_id,
            "game_name": self.game_name,
            "main_story": self.main_story,
            "completionist": self.completionist,
            "game_image_url": self.game_image_url
        }

async def get_game_data(title: str):

    title = title.replace("-", "")

    results = await HowLongToBeat().async_search(title)
    
    if results and len(results) > 0:
        best_match = max(results, key=lambda element: element.similarity)
        game_details = GameDetailsObject.from_hltb_entry(best_match)
        print(json.dumps(game_details.to_dict()))
        return game_details
    else:
        fallback = {
            "game_id": None,
            "game_name": title,
            "main_story": "N/A",
            "completionist": "N/A",
            "game_image_url": ""
        }
        print(json.dumps(fallback))
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_game = sys.argv[1]

    asyncio.run(get_game_data(target_game))