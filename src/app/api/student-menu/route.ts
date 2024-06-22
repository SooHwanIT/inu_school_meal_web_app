import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

interface MenuItem {
    category: string;
    menu: string;
}

interface RestaurantMenu {
    restaurant: string;
    items: MenuItem[];
}

export async function GET() {
    try {
        const { data } = await axios.get('https://inucoop.com/main.php?mkey=2&w=2');
        const $ = cheerio.load(data);

        const menuItems: MenuItem[] = [];

        const todayIndex = new Date().getDay();
        const categories = ['중식(백반)', '중식(일품)', '석식'];

        const dayMapping = {
            0: 7, // Sunday
            1: 1, // Monday
            2: 2, // Tuesday
            3: 3, // Wednesday
            4: 4, // Thursday
            5: 5, // Friday
            6: 6, // Saturday
        };

        $('#menuBox tr').each((i, element) => {
            const cells = $(element).find('td');
            if (cells.length > 1) {
                const category = $(cells[0]).text().trim();
                if (categories.includes(category)) {
                    const menu: MenuItem = {
                        category,
                        menu: $(cells[dayMapping[todayIndex]]).html()?.trim().replace(/<br>/g, '\n') || '❝오늘 등록된 메뉴가 없습니다.❞',
                    };
                    menuItems.push(menu);
                }
            }
        });

        const restaurantMenu: RestaurantMenu = {
            restaurant: '학생 식당',
            items: menuItems,
        };

        return NextResponse.json({ menus: [restaurantMenu] });
    } catch (error) {
        console.error('Failed to fetch data', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
