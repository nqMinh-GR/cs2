import { priceRarity } from './case-mechanics';
import { asiaFoods } from './items/asia-foods';
export type Cuisine='vn'|'jp'|'kr'|'cn'|'tw'|'sg'|'th'|'in'|'me'|'mx'|'it'|'us'|'intl';
export type Food={customId?:string;name:string;nameEn?:string;sub:string;price:number;rarity:number;image:number;cuisine:Cuisine;veg?:boolean;quip:string;photo?:string};
// Approximate lunch portion prices in thousands of VND, not restaurant quotes.
const catalog: Omit<Food,'rarity'>[]=[
  {
    "name": "Cơm tấm",
    "sub": "Sườn bì chả • Việt Nam",
    "price": 45,
    "image": 0, "cuisine": "vn",
    "quip": "Sườn có thể gãy. Kèo này thì không."
  },
  {
    "name": "Phở bò",
    "sub": "Tái nạm • Việt Nam",
    "price": 55,
    "image": 1, "cuisine": "vn",
    "quip": "Đời có thể nhạt. Nước phở thì không."
  },
  {
    "name": "Bánh mì",
    "sub": "Thịt nướng • Việt Nam",
    "price": 25,
    "image": 2, "cuisine": "vn",
    "quip": "Vũ khí cận chiến của dân văn phòng."
  },
  {
    "name": "Bún chả",
    "sub": "Chả nướng • Việt Nam",
    "price": 50,
    "image": 3, "cuisine": "vn",
    "quip": "Một pha gắp chả đi vào lòng người."
  },
  {
    "name": "Sushi cá hồi",
    "sub": "Cá hồi • Nhật Bản",
    "price": 150,
    "image": 4, "cuisine": "jp",
    "quip": "Legendary drop. Ví bạn vừa disconnect."
  },
  {
    "name": "Pizza",
    "sub": "Phô mai • Ý",
    "price": 100,
    "image": 5, "cuisine": "it",
    "quip": "Một miếng cho bạn. Phần còn lại cũng vậy."
  },
  {
    "name": "Gà rán",
    "sub": "Giòn cay • Quốc tế",
    "price": 65,
    "image": 6, "cuisine": "intl",
    "quip": "Winner winner, chicken lunch."
  },
  {
    "name": "Cơm chay",
    "sub": "Đậu hũ & rau • Việt Nam",
    "price": 35,
    "image": 7, "cuisine": "vn",
    "veg": true,
    "quip": "Ăn chay nhưng chiến hết mình."
  },
  {
    "name": "Bibimbap",
    "sub": "Cơm trộn • Hàn Quốc",
    "price": 85,
    "image": 8, "cuisine": "kr",
    "quip": "Trộn cơm. Đừng trộn deadline."
  },
  {
    "name": "Cơm gà Hội An",
    "sub": "Món ăn trưa",
    "price": 45,
    "image": 9, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Bún bò Huế",
    "sub": "Món ăn trưa",
    "price": 50,
    "image": 10, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Hủ tiếu",
    "sub": "Món ăn trưa",
    "price": 40,
    "image": 11, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Mì Quảng",
    "sub": "Món ăn trưa",
    "price": 45,
    "image": 12, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Bún thịt nướng",
    "sub": "Món ăn trưa",
    "price": 40,
    "image": 13, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Bánh cuốn",
    "sub": "Món ăn trưa",
    "price": 35,
    "image": 14, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Bún đậu mắm tôm",
    "sub": "Món ăn trưa",
    "price": 55,
    "image": 15, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Cơm rang dưa bò",
    "sub": "Món ăn trưa",
    "price": 50,
    "image": 16, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Bò lúc lắc",
    "sub": "Món ăn trưa",
    "price": 85,
    "image": 17, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Bánh xèo",
    "sub": "Món ăn trưa",
    "price": 50,
    "image": 18, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Bánh đa cua",
    "sub": "Món ăn trưa",
    "price": 45,
    "image": 19, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Mì xào bò",
    "sub": "Món ăn trưa",
    "price": 45,
    "image": 20, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Bún cá",
    "sub": "Món ăn trưa",
    "price": 40,
    "image": 21, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Gỏi cuốn",
    "sub": "Món ăn trưa",
    "price": 35,
    "image": 22, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Cháo sườn",
    "sub": "Món ăn trưa",
    "price": 25,
    "image": 23, "cuisine": "vn",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Ramen",
    "sub": "Món ăn trưa",
    "price": 100,
    "image": 24, "cuisine": "jp",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Udon",
    "sub": "Món ăn trưa",
    "price": 85,
    "image": 25, "cuisine": "jp",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Cơm cà ri Nhật",
    "sub": "Món ăn trưa",
    "price": 90,
    "image": 26, "cuisine": "jp",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Tteokbokki",
    "sub": "Món ăn trưa",
    "price": 65,
    "image": 27, "cuisine": "kr",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Burger bò",
    "sub": "Món ăn trưa",
    "price": 65,
    "image": 28, "cuisine": "us",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Mì Ý bò bằm",
    "sub": "Món ăn trưa",
    "price": 80,
    "image": 29, "cuisine": "it",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Pad Thai",
    "sub": "Món ăn trưa",
    "price": 75,
    "image": 30, "cuisine": "th",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Mì Tom Yum",
    "sub": "Món ăn trưa",
    "price": 80,
    "image": 31, "cuisine": "th",
    "veg": false,
    "quip": ""
  },
  {
    "name": "Lẩu nấm chay",
    "sub": "Chay",
    "price": 120,
    "image": 32, "cuisine": "vn",
    "veg": true,
    "quip": ""
  },
  {
    "name": "Mì nấm chay",
    "sub": "Chay",
    "price": 40,
    "image": 33, "cuisine": "vn",
    "veg": true,
    "quip": ""
  },
  {
    "name": "Bánh mì chay",
    "sub": "Chay",
    "price": 25,
    "image": 34, "cuisine": "vn",
    "veg": true,
    "quip": ""
  },
  {
    "name": "Gỏi cuốn chay",
    "sub": "Chay",
    "price": 35,
    "image": 35, "cuisine": "vn",
    "veg": true,
    "quip": ""
  },
  {
    "name": "Cơm bình dân",
    "price": 40,
    "image": 36, "cuisine": "vn",
    "sub": "Chọn món mặn, rau & canh",
    "quip": ""
  },
  {
    "name": "Cơm gà xối mỡ",
    "price": 55,
    "image": 39, "cuisine": "vn",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Bún riêu",
    "price": 45,
    "image": 42, "cuisine": "vn",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Bánh canh cua",
    "price": 60,
    "image": 43, "cuisine": "vn",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Bò né",
    "price": 75,
    "image": 44, "cuisine": "vn",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm gà teriyaki",
    "price": 85,
    "image": 45, "cuisine": "jp",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm heo chiên xù",
    "price": 95,
    "image": 46, "cuisine": "jp",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm chiên hải sản",
    "price": 85,
    "image": 47, "cuisine": "vn",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Mì vịt tiềm",
    "price": 95,
    "image": 48, "cuisine": "cn",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Kimbap",
    "price": 70,
    "image": 49, "cuisine": "kr",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Mì trộn Hàn Quốc",
    "price": 75,
    "image": 50, "cuisine": "kr",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Salad ức gà",
    "price": 85,
    "image": 51, "cuisine": "us",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Mì Ý sốt kem bacon",
    "price": 115,
    "image": 52, "cuisine": "it",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Lasagna bò",
    "price": 125,
    "image": 53, "cuisine": "it",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Burger bò phô mai & khoai tây",
    "price": 120,
    "image": 54, "cuisine": "us",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Pizza pepperoni",
    "price": 120,
    "image": 55, "cuisine": "it",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm bò gyudon",
    "price": 110,
    "image": 56, "cuisine": "jp",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm cá saba nướng",
    "price": 110,
    "image": 57, "cuisine": "jp",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Mì soba Nhật",
    "price": 110,
    "image": 58, "cuisine": "jp",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm cà ri Thái",
    "price": 110,
    "image": 59, "cuisine": "th",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Salad cá ngừ",
    "price": 110,
    "image": 60, "cuisine": "us",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Salad quinoa đậu gà",
    "price": 115,
    "image": 61, "cuisine": "us",
    "veg": true,
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Bò bít tết",
    "price": 180,
    "image": 62, "cuisine": "intl",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cá hồi áp chảo",
    "price": 190,
    "image": 63, "cuisine": "intl",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm lươn Nhật",
    "price": 180,
    "image": 64, "cuisine": "jp",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm bò nướng Hàn",
    "price": 150,
    "image": 65, "cuisine": "kr",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Cơm cá hồi teriyaki",
    "price": 150,
    "image": 66, "cuisine": "jp",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Poke cá hồi",
    "price": 160,
    "image": 67, "cuisine": "us",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Sườn nướng BBQ",
    "price": 230,
    "image": 68, "cuisine": "us",
    "sub": "Kèm cơm hoặc khoai tây • Phần một người",
    "quip": ""
  },
  {
    "name": "Pizza hải sản",
    "price": 160,
    "image": 69, "cuisine": "it",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Mì Ý hải sản",
    "price": 160,
    "image": 70, "cuisine": "it",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Lẩu bò cá nhân",
    "price": 160,
    "image": 71, "cuisine": "vn",
    "sub": "Phần ăn trưa / người",
    "quip": ""
  },
  {
    "name": "Phở gà",
    "price": 55,
    "sub": "Tô thường • Việt Nam",
    "veg": false,
    "image": 72, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Phở cuốn",
    "price": 70,
    "sub": "Phần 10 cuốn • Việt Nam",
    "veg": false,
    "image": 73, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Bún mọc",
    "price": 45,
    "sub": "Tô thường • Việt Nam",
    "veg": false,
    "image": 74, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Bún măng vịt",
    "price": 60,
    "sub": "Tô có thịt vịt • Việt Nam",
    "veg": false,
    "image": 75, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Bún bò Nam Bộ",
    "price": 60,
    "sub": "Bún trộn bò • Việt Nam",
    "veg": false,
    "image": 76, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Bún mắm",
    "price": 65,
    "sub": "Tô hải sản • Việt Nam",
    "veg": false,
    "image": 77, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Bún chay",
    "price": 35,
    "sub": "Đậu hũ & rau • Việt Nam",
    "veg": true,
    "image": 78, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Bánh canh giò heo",
    "price": 50,
    "sub": "Tô thường • Việt Nam",
    "veg": false,
    "image": 79, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Miến gà",
    "price": 55,
    "sub": "Tô thường • Việt Nam",
    "veg": false,
    "image": 80, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Miến lươn",
    "price": 65,
    "sub": "Tô thường • Việt Nam",
    "veg": false,
    "image": 81, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Cháo vịt",
    "price": 55,
    "sub": "Phần có thịt vịt • Việt Nam",
    "veg": false,
    "image": 82, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Cháo lòng",
    "price": 40,
    "sub": "Phần có lòng • Việt Nam",
    "veg": false,
    "image": 83, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Bánh hỏi heo quay",
    "price": 50,
    "sub": "Một phần • Việt Nam",
    "veg": false,
    "image": 84, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Nem nướng",
    "price": 55,
    "sub": "Phần cuốn đủ bữa • Việt Nam",
    "veg": false,
    "image": 85, "cuisine": "vn",
    "quip": ""
  },
  {
    "name": "Dimsum",
    "price": 130,
    "sub": "Khoảng 3 xửng / người",
    "veg": false,
    "image": 86, "cuisine": "cn",
    "quip": ""
  },
  {
    "name": "Mì hoành thánh",
    "price": 60,
    "sub": "Tô mì & hoành thánh",
    "veg": false,
    "image": 87, "cuisine": "cn",
    "quip": ""
  },
  {
    "name": "Mì bò Đài Loan",
    "price": 85,
    "sub": "Bò hầm & mì • Đài Loan",
    "veg": false,
    "image": 88, "cuisine": "tw",
    "quip": ""
  },
  {
    "name": "Mì xào giòn",
    "price": 70,
    "sub": "Hải sản & rau củ",
    "veg": false,
    "image": 89, "cuisine": "cn",
    "quip": ""
  },
  {
    "name": "Cơm niêu Singapore",
    "price": 85,
    "sub": "Một niêu / người",
    "veg": false,
    "image": 90, "cuisine": "sg",
    "quip": ""
  },
  {
    "name": "Cơm gà Hải Nam",
    "price": 75,
    "sub": "Gà luộc & cơm thơm",
    "veg": false,
    "image": 91, "cuisine": "sg",
    "quip": ""
  },
  {
    "name": "Cơm gà trứng Nhật",
    "price": 100,
    "sub": "Oyakodon • Nhật Bản",
    "veg": false,
    "image": 92, "cuisine": "jp",
    "quip": ""
  },
  {
    "name": "Cơm tempura",
    "price": 130,
    "sub": "Tendon • Nhật Bản",
    "veg": false,
    "image": 93, "cuisine": "jp",
    "quip": ""
  },
  {
    "name": "Mì cay Hàn Quốc",
    "price": 65,
    "sub": "Một tô • Hàn Quốc",
    "veg": false,
    "image": 94, "cuisine": "kr",
    "quip": ""
  },
  {
    "name": "Mì tương đen",
    "price": 70,
    "sub": "Jajangmyeon • Hàn Quốc",
    "veg": false,
    "image": 95, "cuisine": "kr",
    "quip": ""
  },
  {
    "name": "Mì lạnh Hàn Quốc",
    "price": 95,
    "sub": "Naengmyeon • Hàn Quốc",
    "veg": false,
    "image": 96, "cuisine": "kr",
    "quip": ""
  },
  {
    "name": "Canh kimchi kèm cơm",
    "price": 85,
    "sub": "Kimchi jjigae • Hàn Quốc",
    "veg": false,
    "image": 97, "cuisine": "kr",
    "quip": ""
  },
  {
    "name": "Canh đậu hũ non kèm cơm",
    "price": 85,
    "sub": "Sundubu jjigae • Hàn Quốc",
    "veg": false,
    "image": 98, "cuisine": "kr",
    "quip": ""
  },
  {
    "name": "Gà phô mai Hàn Quốc",
    "price": 120,
    "sub": "Phần một người",
    "veg": false,
    "image": 99, "cuisine": "kr",
    "quip": ""
  },
  {
    "name": "Cơm chiên kimchi",
    "price": 65,
    "sub": "Kimchi bokkeumbap • Hàn Quốc",
    "veg": false,
    "image": 100, "cuisine": "kr",
    "quip": ""
  },
  {
    "name": "Lẩu Thái một người",
    "price": 130,
    "sub": "Kèm bún hoặc mì",
    "veg": false,
    "image": 101, "cuisine": "th",
    "quip": ""
  },
  {
    "name": "Lẩu sukiyaki một người",
    "price": 220,
    "sub": "Thịt, rau & mì • Nhật Bản",
    "veg": false,
    "image": 102, "cuisine": "jp",
    "quip": ""
  },
  {
    "name": "Cà ri Ấn Độ & naan",
    "price": 220,
    "sub": "Cà ri gà kèm bánh naan",
    "veg": false,
    "image": 103, "cuisine": "in",
    "quip": ""
  },
  {
    "name": "Cơm biryani",
    "price": 190,
    "sub": "Cơm gia vị & gà • Ấn Độ",
    "veg": false,
    "image": 104, "cuisine": "in",
    "quip": ""
  },
  {
    "name": "Bánh xèo Nhật",
    "price": 110,
    "sub": "Okonomiyaki • Nhật Bản",
    "veg": false,
    "image": 105, "cuisine": "jp",
    "quip": ""
  },
  {
    "name": "Sandwich",
    "price": 80,
    "sub": "Phần bánh kẹp đủ bữa",
    "veg": false,
    "image": 106, "cuisine": "intl",
    "quip": ""
  },
  {
    "name": "Bánh mì kebab",
    "price": 35,
    "sub": "Doner kebab • Thổ Nhĩ Kỳ",
    "veg": false,
    "image": 107, "cuisine": "me",
    "quip": ""
  },
  {
    "name": "Bánh cuộn gà",
    "price": 95,
    "sub": "Chicken wrap",
    "veg": false,
    "image": 108, "cuisine": "intl",
    "quip": ""
  },
  {
    "name": "Burrito",
    "price": 150,
    "sub": "Cuộn cơm, đậu & thịt • Mexico",
    "veg": false,
    "image": 109, "cuisine": "mx",
    "quip": ""
  },
  {
    "name": "Taco",
    "price": 150,
    "sub": "Phần 3 bánh • Mexico",
    "veg": false,
    "image": 110, "cuisine": "mx",
    "quip": ""
  },
  {
    "name": "Quesadilla",
    "price": 140,
    "sub": "Phô mai & gà • Mexico",
    "veg": false,
    "image": 111, "cuisine": "mx",
    "quip": ""
  },
  {
    "name": "Fish & chips",
    "price": 170,
    "sub": "Cá chiên & khoai tây",
    "veg": false,
    "image": 112, "cuisine": "intl",
    "quip": ""
  },
  {
    "name": "Gà nướng kèm khoai tây",
    "price": 140,
    "sub": "Phần một người",
    "veg": false,
    "image": 113, "cuisine": "intl",
    "quip": ""
  },
  {
    "name": "Mac & cheese",
    "price": 150,
    "sub": "Nui phô mai • Phần chính",
    "veg": false,
    "image": 114, "cuisine": "us",
    "quip": ""
  },
  {
    "name": "Mì Ý pesto",
    "price": 170,
    "sub": "Húng quế & gà • Ý",
    "veg": false,
    "image": 115, "cuisine": "it",
    "quip": ""
  },
  {
    "name": "Mì Ý cá hồi",
    "price": 230,
    "sub": "Sốt kem cá hồi • Ý",
    "veg": false,
    "image": 116, "cuisine": "it",
    "quip": ""
  },
  {
    "name": "Cơm risotto",
    "price": 260,
    "sub": "Cơm Ý • Phần chính",
    "veg": false,
    "image": 117, "cuisine": "it",
    "quip": ""
  },
  {
    "name": "Gnocchi",
    "price": 250,
    "sub": "Bánh khoai tây kiểu Ý",
    "veg": false,
    "image": 118, "cuisine": "it",
    "quip": ""
  },
  {
    "name": "Falafel kèm pita",
    "price": 150,
    "sub": "Đậu gà, rau & bánh pita",
    "veg": true,
    "image": 119, "cuisine": "me",
    "quip": ""
  },
{
  "name": "Nui xào bò",
  "price": 50,
  "sub": "Nui, bò & rau • Việt Nam",
  "quip": "Nui deadline lại. Ăn trước đã.",
  "image": 120, "cuisine": "vn"
},
{
  "name": "Cháo gà",
  "price": 45,
  "sub": "Gà xé & hành tiêu • Việt Nam",
  "quip": "Một bát hồi máu giữa giờ làm.",
  "image": 121, "cuisine": "vn"
},
{
  "name": "Bò kho bánh mì",
  "price": 65,
  "sub": "Bò hầm & bánh mì • Việt Nam",
  "quip": "Chấm bánh mì. Đừng chấm công muộn.",
  "image": 122, "cuisine": "vn"
},
{
  "name": "Xôi mặn",
  "price": 35,
  "sub": "Gà, thịt hoặc chả • Việt Nam",
  "quip": "Dẻo dai đến hết ca chiều.",
  "image": 123, "cuisine": "vn"
},
{
  "name": "Bánh mì chảo",
  "price": 45,
  "sub": "Trứng, pa tê & xúc xích • Việt Nam",
  "quip": "Nóng hơn cả nhóm chat công ty.",
  "image": 124, "cuisine": "vn"
},
{
  "name": "Cơm xá xíu",
  "price": 55,
  "sub": "Thịt xá xíu & cơm • Món Hoa",
  "quip": "Xá xíu một chút. No cả buổi.",
  "image": 125, "cuisine": "cn"
},
{
  "name": "Cơm vịt quay",
  "price": 75,
  "sub": "Vịt quay & cơm • Món Hoa",
  "quip": "Da giòn. Tinh thần cũng lên.",
  "image": 126, "cuisine": "cn"
},
{
  "name": "Mì xá xíu",
  "price": 55,
  "sub": "Mì trứng & thịt xá xíu • Món Hoa",
  "quip": "Sợi mì dài hơn thời gian nghỉ trưa.",
  "image": 127, "cuisine": "cn"
},
{
  "name": "Mì udon xào",
  "price": 110,
  "sub": "Hải sản & rau • Nhật Bản",
  "quip": "Sợi to. Kèo thơm.",
  "image": 128, "cuisine": "jp"
},
{
  "name": "Burger gà & khoai tây",
  "price": 80,
  "sub": "Gà giòn & khoai tây • Quốc tế",
  "quip": "Cắn một phát. Hết phân vân.",
  "image": 129, "cuisine": "intl"
},
{
  "name": "Mì Ý sốt cà chua & phô mai",
  "price": 170,
  "sub": "Cà chua & mascarpone • Ý",
  "quip": "Sốt cà chua cứu một ngày nhạt nhẽo.",
  "image": 130, "cuisine": "it"
},
{
  "name": "Miến xào",
  "price": 55,
  "sub": "Thịt & rau • Việt Nam",
  "quip": "Miến này không phải miếng mồi deadline.",
  "image": 131, "cuisine": "vn"
}
];
export const foods:Food[]=[...catalog, ...asiaFoods].map(food=>({...food,cuisine:food.cuisine as Cuisine,rarity:priceRarity(food.price)}));
