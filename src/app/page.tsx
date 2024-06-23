'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Divider,
    CssBaseline,
    Grid
} from '@mui/material';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';

// Custom styles using styled API
const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    boxShadow: theme.shadows[4],
    borderRadius: theme.shape.borderRadius,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
    color: theme.palette.common.white,
    fontWeight: theme.typography.fontWeightBold,
    textAlign: 'center',
}));

const StyledTableBodyCell = styled(TableCell)(({ theme }) => ({
    textAlign: 'center',
    whiteSpace: 'pre-wrap', // Preserve whitespace for preformatted text
    padding: theme.spacing(1), // Adjust padding for better spacing
}));

const StyledTitle = styled((props: { children: string }) => (
    <Typography variant="h3" component="h1" {...props} />
))(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: '2rem', // Adjust font size
}));

const StyledRestaurantTitle = styled((props: { children: string }) => (
    <Typography variant="h5" component="h2" {...props} />
))(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    color: theme.palette.secondary.main,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(4, 0),
}));

interface MenuItem {
    category: string;
    menu: string;
}

interface RestaurantMenu {
    restaurant: string;
    items: MenuItem[];
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontWeightBold: 700,
    },
});

export default function Home() {
    const [studentMenus, setStudentMenus] = useState<RestaurantMenu[]>([]);
    const [professorMenus, setProfessorMenus] = useState<RestaurantMenu[]>([]);

    useEffect(() => {
        async function fetchMenus() {
            try {
                const [studentRes, professorRes] = await Promise.all([
                    fetch('/api/student-menu'),
                    fetch('/api/professor-menu')
                ]);

                if (!studentRes.ok || !professorRes.ok) {
                    throw new Error('Network response was not ok');
                }

                const studentData = await studentRes.json();
                const professorData = await professorRes.json();

                setStudentMenus(studentData.menus);
                setProfessorMenus(professorData.menus);
            } catch (error) {
                console.error('Failed to fetch menus:', error);
            }
        }

        fetchMenus();
    }, []);

    const cleanMenu = (menu: string) => {
        const parts = menu.split('--------------');
        return parts[0].trim();
    };

    const formatMenu = (menu: string) => {
        const cleanedMenu = cleanMenu(menu);
        const lines = cleanedMenu.split('\n');
        const kcalLine = lines.find(line => line.toLowerCase().includes('kcal'));
        const priceLine = lines.find(line => line.includes('원'));
        const priceMatches = priceLine ? priceLine.match(/\d{1,2},?\d{0,3}원/g) : null;
        const [generalPrice, memberPrice] = priceMatches ? priceMatches : ['', ''];
        const menuLines = lines.filter(line => !line.includes('원') && !line.toLowerCase().includes('kcal'));
        return {
            items: menuLines,
            kcal: kcalLine || '',
            generalPrice,
            memberPrice
        };
    };

    const renderTable = (menus: RestaurantMenu[]) => (
        menus.map((restaurantMenu, index) => (
            <Box key={index} mb={4}>
                <StyledRestaurantTitle>
                    {restaurantMenu.restaurant}
                </StyledRestaurantTitle>
                <StyledPaper>
                    <TableContainer>
                        <Table>
                            <StyledTableHead>
                                <TableRow>
                                    <StyledTableHeadCell>Category</StyledTableHeadCell>
                                    <StyledTableHeadCell>Menu</StyledTableHeadCell>
                                </TableRow>
                            </StyledTableHead>
                            <TableBody>
                                {restaurantMenu.items.map((item, idx) => {
                                    const { items, kcal, generalPrice, memberPrice } = formatMenu(item.menu);
                                    return (
                                        <TableRow key={idx}>
                                            <StyledTableBodyCell>
                                                <Typography variant="body1">{item.category}</Typography>
                                                <Typography variant="body2" color="textSecondary">{kcal}</Typography>
                                                <Typography variant="body2" color="textSecondary">일반인 {generalPrice}</Typography>
                                                <Typography variant="body2" color="textSecondary">구성원 {memberPrice}</Typography>
                                            </StyledTableBodyCell>
                                            <StyledTableBodyCell>
                                                {items.map((line, index) => (
                                                    <Typography variant="body2" component="span" key={index} display="block" gutterBottom>
                                                        {line}
                                                    </Typography>
                                                ))}
                                            </StyledTableBodyCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </StyledPaper>
            </Box>
        ))
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="sm">
                <StyledTitle>
                    인천대 오늘의 학식
                </StyledTitle>
                {studentMenus.length === 0 && professorMenus.length === 0 ? (
                    <Typography variant="body1" align="center">Loading...</Typography>
                ) : (
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            {renderTable(studentMenus)}
                        </Grid>
                        <StyledDivider />
                        <Grid item xs={12}>
                            {renderTable(professorMenus)}
                        </Grid>
                    </Grid>
                )}
            </Container>
        </ThemeProvider>
    );
}
