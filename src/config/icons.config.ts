/**
 * Icons Config
 *
 * The approved icon set, and the only place the icon provider is named. Every key here is
 * an icon the app can render and a user can select; keys are stable and stored on records,
 * so the provider behind them can change without touching a consumer or stored data.
 *
 * Icons are imported one file at a time so the bundle carries only the icons listed.
 *
 * A key is never removed once records may hold it. Retiring an icon marks it `deprecated`:
 * it keeps rendering wherever it is stored, and a picker stops offering it.
 */

import type { ComponentType } from 'react';
import IconTarget from '@tabler/icons-react/dist/esm/icons/IconTarget.mjs';
import IconChartLine from '@tabler/icons-react/dist/esm/icons/IconChartLine.mjs';
import IconDatabase from '@tabler/icons-react/dist/esm/icons/IconDatabase.mjs';
import IconPlug from '@tabler/icons-react/dist/esm/icons/IconPlug.mjs';
import IconKeyGlyph from '@tabler/icons-react/dist/esm/icons/IconKey.mjs';
import IconCalculator from '@tabler/icons-react/dist/esm/icons/IconCalculator.mjs';
import IconBulb from '@tabler/icons-react/dist/esm/icons/IconBulb.mjs';
import IconShare from '@tabler/icons-react/dist/esm/icons/IconShare.mjs';
import IconNews from '@tabler/icons-react/dist/esm/icons/IconNews.mjs';
import IconConfetti from '@tabler/icons-react/dist/esm/icons/IconConfetti.mjs';
import IconArticle from '@tabler/icons-react/dist/esm/icons/IconArticle.mjs';
import IconTool from '@tabler/icons-react/dist/esm/icons/IconTool.mjs';
import IconRss from '@tabler/icons-react/dist/esm/icons/IconRss.mjs';
import IconHeartHandshake from '@tabler/icons-react/dist/esm/icons/IconHeartHandshake.mjs';
import IconBriefcase from '@tabler/icons-react/dist/esm/icons/IconBriefcase.mjs';
import IconApps from '@tabler/icons-react/dist/esm/icons/IconApps.mjs';
import IconBuildingPavilion from '@tabler/icons-react/dist/esm/icons/IconBuildingPavilion.mjs';
import IconCalendarEvent from '@tabler/icons-react/dist/esm/icons/IconCalendarEvent.mjs';
import IconMicrophone from '@tabler/icons-react/dist/esm/icons/IconMicrophone.mjs';
import IconSpeakerphone from '@tabler/icons-react/dist/esm/icons/IconSpeakerphone.mjs';
import IconBell from '@tabler/icons-react/dist/esm/icons/IconBell.mjs';
import IconChevronRight from '@tabler/icons-react/dist/esm/icons/IconChevronRight.mjs';
import IconChevronLeft from '@tabler/icons-react/dist/esm/icons/IconChevronLeft.mjs';
import IconFlask from '@tabler/icons-react/dist/esm/icons/IconFlask.mjs';
import IconUsers from '@tabler/icons-react/dist/esm/icons/IconUsers.mjs';
import IconSun from '@tabler/icons-react/dist/esm/icons/IconSun.mjs';
import IconMoon from '@tabler/icons-react/dist/esm/icons/IconMoon.mjs';
import IconUser from '@tabler/icons-react/dist/esm/icons/IconUser.mjs';
import IconSettings from '@tabler/icons-react/dist/esm/icons/IconSettings.mjs';
import IconPalette from '@tabler/icons-react/dist/esm/icons/IconPalette.mjs';
import IconWorld from '@tabler/icons-react/dist/esm/icons/IconWorld.mjs';
import IconCurrencyDollar from '@tabler/icons-react/dist/esm/icons/IconCurrencyDollar.mjs';
import IconSwitchHorizontal from '@tabler/icons-react/dist/esm/icons/IconSwitchHorizontal.mjs';
import IconLogout from '@tabler/icons-react/dist/esm/icons/IconLogout.mjs';
import IconMail from '@tabler/icons-react/dist/esm/icons/IconMail.mjs';
import IconMailOpened from '@tabler/icons-react/dist/esm/icons/IconMailOpened.mjs';
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash.mjs';
import IconDotsVertical from '@tabler/icons-react/dist/esm/icons/IconDotsVertical.mjs';
import IconXboxX from '@tabler/icons-react/dist/esm/icons/IconXboxX.mjs';
import IconAbc from '@tabler/icons-react/dist/esm/icons/IconAbc.mjs';
import IconLock from '@tabler/icons-react/dist/esm/icons/IconLock.mjs';
import IconSearch from '@tabler/icons-react/dist/esm/icons/IconSearch.mjs';
import IconNumber123 from '@tabler/icons-react/dist/esm/icons/IconNumber123.mjs';
import IconLink from '@tabler/icons-react/dist/esm/icons/IconLink.mjs';
import IconCalendarWeek from '@tabler/icons-react/dist/esm/icons/IconCalendarWeek.mjs';
import IconDeviceFloppy from '@tabler/icons-react/dist/esm/icons/IconDeviceFloppy.mjs';
import IconBuilding from '@tabler/icons-react/dist/esm/icons/IconBuilding.mjs';
import IconCheck from '@tabler/icons-react/dist/esm/icons/IconCheck.mjs';
import IconX from '@tabler/icons-react/dist/esm/icons/IconX.mjs';
import IconPointFilled from '@tabler/icons-react/dist/esm/icons/IconPointFilled.mjs';
import IconPoint from '@tabler/icons-react/dist/esm/icons/IconPoint.mjs';
import IconAlertTriangle from '@tabler/icons-react/dist/esm/icons/IconAlertTriangle.mjs';
import IconInfoCircle from '@tabler/icons-react/dist/esm/icons/IconInfoCircle.mjs';
import IconLayoutGrid from '@tabler/icons-react/dist/esm/icons/IconLayoutGrid.mjs';
import IconTable from '@tabler/icons-react/dist/esm/icons/IconTable.mjs';
import IconPackage from '@tabler/icons-react/dist/esm/icons/IconPackage.mjs';
import IconBuildingWarehouse from '@tabler/icons-react/dist/esm/icons/IconBuildingWarehouse.mjs';
import IconBottle from '@tabler/icons-react/dist/esm/icons/IconBottle.mjs';
import IconTruck from '@tabler/icons-react/dist/esm/icons/IconTruck.mjs';
import IconChevronDown from '@tabler/icons-react/dist/esm/icons/IconChevronDown.mjs';
import IconPhone from '@tabler/icons-react/dist/esm/icons/IconPhone.mjs';
import IconTrendingUp from '@tabler/icons-react/dist/esm/icons/IconTrendingUp.mjs';
import IconTrendingDown from '@tabler/icons-react/dist/esm/icons/IconTrendingDown.mjs';
import IconPencil from '@tabler/icons-react/dist/esm/icons/IconPencil.mjs';
import IconPlus from '@tabler/icons-react/dist/esm/icons/IconPlus.mjs';
import IconXFilled from '@tabler/icons-react/dist/esm/icons/IconXFilled.mjs';
import IconExternalLink from '@tabler/icons-react/dist/esm/icons/IconExternalLink.mjs';
import IconFilter from '@tabler/icons-react/dist/esm/icons/IconFilter.mjs';
import IconFilterFilled from '@tabler/icons-react/dist/esm/icons/IconFilterFilled.mjs';
import IconArrowsSort from '@tabler/icons-react/dist/esm/icons/IconArrowsSort.mjs';
import IconSortAscending from '@tabler/icons-react/dist/esm/icons/IconSortAscending.mjs';
import IconSortDescending from '@tabler/icons-react/dist/esm/icons/IconSortDescending.mjs';
import IconList from '@tabler/icons-react/dist/esm/icons/IconList.mjs';
import IconMap2 from '@tabler/icons-react/dist/esm/icons/IconMap2.mjs';
import IconMessageCircle from '@tabler/icons-react/dist/esm/icons/IconMessageCircle.mjs';
import IconBold from '@tabler/icons-react/dist/esm/icons/IconBold.mjs';
import IconItalic from '@tabler/icons-react/dist/esm/icons/IconItalic.mjs';
import IconListNumbers from '@tabler/icons-react/dist/esm/icons/IconListNumbers.mjs';
import IconRefresh from '@tabler/icons-react/dist/esm/icons/IconRefresh.mjs';
import IconRestore from '@tabler/icons-react/dist/esm/icons/IconRestore.mjs';
import IconTrashX from '@tabler/icons-react/dist/esm/icons/IconTrashX.mjs';
import IconMapPin from '@tabler/icons-react/dist/esm/icons/IconMapPin.mjs';
import IconMapPinDollar from '@tabler/icons-react/dist/esm/icons/IconMapPinDollar.mjs';
import IconMailPin from '@tabler/icons-react/dist/esm/icons/IconMailPin.mjs';
import IconMailSpark from '@tabler/icons-react/dist/esm/icons/IconMailSpark.mjs';
import IconBuildingFactory2 from '@tabler/icons-react/dist/esm/icons/IconBuildingFactory2.mjs';
import IconBuildingStore from '@tabler/icons-react/dist/esm/icons/IconBuildingStore.mjs';
import IconTruckDelivery from '@tabler/icons-react/dist/esm/icons/IconTruckDelivery.mjs';
import IconTruckReturn from '@tabler/icons-react/dist/esm/icons/IconTruckReturn.mjs';
import IconTruckLoading from '@tabler/icons-react/dist/esm/icons/IconTruckLoading.mjs';
import IconJetpack from '@tabler/icons-react/dist/esm/icons/IconJetpack.mjs';
import IconTransferOut from '@tabler/icons-react/dist/esm/icons/IconTransferOut.mjs';
import IconShoppingCartBolt from '@tabler/icons-react/dist/esm/icons/IconShoppingCartBolt.mjs';
import IconShoppingCart from '@tabler/icons-react/dist/esm/icons/IconShoppingCart.mjs';
import IconShieldCheck from '@tabler/icons-react/dist/esm/icons/IconShieldCheck.mjs';
import IconTag from '@tabler/icons-react/dist/esm/icons/IconTag.mjs';
import IconFlower from '@tabler/icons-react/dist/esm/icons/IconFlower.mjs';
import IconDroplet from '@tabler/icons-react/dist/esm/icons/IconDroplet.mjs';
import IconIdBadge2 from '@tabler/icons-react/dist/esm/icons/IconIdBadge2.mjs';
import IconUsersGroup from '@tabler/icons-react/dist/esm/icons/IconUsersGroup.mjs';
import IconAddressBook from '@tabler/icons-react/dist/esm/icons/IconAddressBook.mjs';
import IconHome from '@tabler/icons-react/dist/esm/icons/IconHome.mjs';
import IconReceipt from '@tabler/icons-react/dist/esm/icons/IconReceipt.mjs';
import IconFileInvoice from '@tabler/icons-react/dist/esm/icons/IconFileInvoice.mjs';
import IconCreditCard from '@tabler/icons-react/dist/esm/icons/IconCreditCard.mjs';
import IconPercentage from '@tabler/icons-react/dist/esm/icons/IconPercentage.mjs';
import IconCertificate from '@tabler/icons-react/dist/esm/icons/IconCertificate.mjs';
import IconRosetteDiscountCheck from '@tabler/icons-react/dist/esm/icons/IconRosetteDiscountCheck.mjs';
import IconPackages from '@tabler/icons-react/dist/esm/icons/IconPackages.mjs';
import IconPackageImport from '@tabler/icons-react/dist/esm/icons/IconPackageImport.mjs';
import IconPackageExport from '@tabler/icons-react/dist/esm/icons/IconPackageExport.mjs';
import IconForklift from '@tabler/icons-react/dist/esm/icons/IconForklift.mjs';
import IconBarcode from '@tabler/icons-react/dist/esm/icons/IconBarcode.mjs';
import IconQrcode from '@tabler/icons-react/dist/esm/icons/IconQrcode.mjs';
import IconScale from '@tabler/icons-react/dist/esm/icons/IconScale.mjs';
import IconTemperature from '@tabler/icons-react/dist/esm/icons/IconTemperature.mjs';
import IconFlame from '@tabler/icons-react/dist/esm/icons/IconFlame.mjs';
import IconClockHour4 from '@tabler/icons-react/dist/esm/icons/IconClockHour4.mjs';
import IconClipboardCheck from '@tabler/icons-react/dist/esm/icons/IconClipboardCheck.mjs';
import IconLeaf from '@tabler/icons-react/dist/esm/icons/IconLeaf.mjs';
import IconPlant from '@tabler/icons-react/dist/esm/icons/IconPlant.mjs';
import IconPlant2 from '@tabler/icons-react/dist/esm/icons/IconPlant2.mjs';
import IconSeedling from '@tabler/icons-react/dist/esm/icons/IconSeedling.mjs';
import IconClover from '@tabler/icons-react/dist/esm/icons/IconClover.mjs';
import IconCactus from '@tabler/icons-react/dist/esm/icons/IconCactus.mjs';
import IconMushroom from '@tabler/icons-react/dist/esm/icons/IconMushroom.mjs';
import IconWheat from '@tabler/icons-react/dist/esm/icons/IconWheat.mjs';
import IconLemon from '@tabler/icons-react/dist/esm/icons/IconLemon.mjs';
import IconCarrot from '@tabler/icons-react/dist/esm/icons/IconCarrot.mjs';
import IconCherry from '@tabler/icons-react/dist/esm/icons/IconCherry.mjs';
import IconFeather from '@tabler/icons-react/dist/esm/icons/IconFeather.mjs';
import IconMoneybagPlus from '@tabler/icons-react/dist/esm/icons/IconMoneybagPlus.mjs';
import IconReportMoney from '@tabler/icons-react/dist/esm/icons/IconReportMoney.mjs';
import IconContract from '@tabler/icons-react/dist/esm/icons/IconContract.mjs';
import IconAd2 from '@tabler/icons-react/dist/esm/icons/IconAd2.mjs';
import IconCloudComputing from '@tabler/icons-react/dist/esm/icons/IconCloudComputing.mjs';
import IconMessageCircleUser from '@tabler/icons-react/dist/esm/icons/IconMessageCircleUser.mjs';
import IconBox from '@tabler/icons-react/dist/esm/icons/IconBox.mjs';
import IconPerfume from '@tabler/icons-react/dist/esm/icons/IconPerfume.mjs';
import IconDropletHalf2 from '@tabler/icons-react/dist/esm/icons/IconDropletHalf2.mjs';
import IconRadioactive from '@tabler/icons-react/dist/esm/icons/IconRadioactive.mjs';
import IconSalt from '@tabler/icons-react/dist/esm/icons/IconSalt.mjs';
import IconColorSwatch from '@tabler/icons-react/dist/esm/icons/IconColorSwatch.mjs';
import IconMacro from '@tabler/icons-react/dist/esm/icons/IconMacro.mjs';
import IconSnowman from '@tabler/icons-react/dist/esm/icons/IconSnowman.mjs';
import IconPepper from '@tabler/icons-react/dist/esm/icons/IconPepper.mjs';
import IconBucketDroplet from '@tabler/icons-react/dist/esm/icons/IconBucketDroplet.mjs';
import IconWashHand from '@tabler/icons-react/dist/esm/icons/IconWashHand.mjs';
import IconCandle from '@tabler/icons-react/dist/esm/icons/IconCandle.mjs';
import IconBath from '@tabler/icons-react/dist/esm/icons/IconBath.mjs';
import IconSpray from '@tabler/icons-react/dist/esm/icons/IconSpray.mjs';
import IconCheese from '@tabler/icons-react/dist/esm/icons/IconCheese.mjs';
import IconMountain from '@tabler/icons-react/dist/esm/icons/IconMountain.mjs';
import IconBowlSpoon from '@tabler/icons-react/dist/esm/icons/IconBowlSpoon.mjs';

/** The props every provider icon is rendered with. Colour defaults to `currentColor`, so theme and mode flow through. */
export interface IconComponentProps
{
    size?: number;
    width?: number;
    color?: string;
    stroke?: number;
}

/** Groups a picker filters by. Display only — they restrict nothing. */
export type IconCategory = 'interface' | 'people' | 'places' | 'commerce' | 'shipping' | 'ingredients' | 'production';

export interface IconDefinition
{
    /** The provider's component. */
    component: ComponentType<IconComponentProps>;
    /** Translation key naming the icon, for a picker. */
    label?: string;
    /** Grouping for a picker. Display only — it restricts nothing. */
    category?: IconCategory;
    /** Still renders where stored; no longer offered for selection. */
    deprecated?: boolean;
}

export const ICONS = {
    bell: { component: IconBell, category: 'interface', label: 'icons.bell' },
    user: { component: IconUser, category: 'people', label: 'icons.user' },
    settings: { component: IconSettings, category: 'interface', label: 'icons.settings' },
    palette: { component: IconPalette, category: 'ingredients', label: 'icons.palette' },
    world: { component: IconWorld, category: 'places', label: 'icons.world' },
    currency: { component: IconCurrencyDollar, category: 'commerce', label: 'icons.currency' },
    switch: { component: IconSwitchHorizontal, category: 'interface', label: 'icons.switch' },
    logout: { component: IconLogout, category: 'interface', label: 'icons.logout' },
    mail: { component: IconMail, category: 'people', label: 'icons.mail' },
    mailOpen: { component: IconMailOpened, category: 'interface', label: 'icons.mailOpen' },
    trash: { component: IconTrash, category: 'interface', label: 'icons.trash' },
    dotsVertical: { component: IconDotsVertical, category: 'interface', label: 'icons.dotsVertical' },
    close: { component: IconXboxX, category: 'interface', label: 'icons.close' },
    text: { component: IconAbc, category: 'interface', label: 'icons.text' },
    lock: { component: IconLock, category: 'interface', label: 'icons.lock' },
    search: { component: IconSearch, category: 'interface', label: 'icons.search' },
    number: { component: IconNumber123, category: 'interface', label: 'icons.number' },
    link: { component: IconLink, category: 'interface', label: 'icons.link' },
    calendar: { component: IconCalendarWeek, category: 'commerce', label: 'icons.calendar' },
    save: { component: IconDeviceFloppy, category: 'interface', label: 'icons.save' },
    building: { component: IconBuilding, category: 'places', label: 'icons.building' },
    check: { component: IconCheck, category: 'interface', label: 'icons.check' },
    x: { component: IconX, category: 'interface', label: 'icons.x' },
    pointFilled: { component: IconPointFilled, category: 'interface', label: 'icons.pointFilled' },
    point: { component: IconPoint, category: 'interface', label: 'icons.point' },
    alertTriangle: { component: IconAlertTriangle, category: 'production', label: 'icons.alertTriangle' },
    infoCircle: { component: IconInfoCircle, category: 'interface', label: 'icons.infoCircle' },
    layoutGrid: { component: IconLayoutGrid, category: 'interface', label: 'icons.layoutGrid' },
    table: { component: IconTable, category: 'interface', label: 'icons.table' },
    package: { component: IconPackage, category: 'production', label: 'icons.package' },
    buildingWarehouse: { component: IconBuildingWarehouse, category: 'places', label: 'icons.buildingWarehouse' },
    bottle: { component: IconBottle, category: 'production', label: 'icons.bottle' },
    truck: { component: IconTruck, category: 'shipping', label: 'icons.truck' },
    chevronDown: { component: IconChevronDown, category: 'interface', label: 'icons.chevronDown' },
    phone: { component: IconPhone, category: 'people', label: 'icons.phone' },
    trendingUp: { component: IconTrendingUp, category: 'commerce', label: 'icons.trendingUp' },
    trendingDown: { component: IconTrendingDown, category: 'interface', label: 'icons.trendingDown' },
    edit: { component: IconPencil, category: 'interface', label: 'icons.edit' },
    plus: { component: IconPlus, category: 'interface', label: 'icons.plus' },
    chevronRight: { component: IconChevronRight, category: 'interface', label: 'icons.chevronRight' },
    chevronLeft: { component: IconChevronLeft, category: 'interface', label: 'icons.chevronLeft' },
    flask: { component: IconFlask, category: 'production', label: 'icons.flask' },
    users: { component: IconUsers, category: 'people', label: 'icons.users' },
    sun: { component: IconSun, category: 'interface', label: 'icons.sun' },
    moon: { component: IconMoon, category: 'interface', label: 'icons.moon' },
    xFilled: { component: IconXFilled, category: 'interface', label: 'icons.xFilled' },
    externalLink: { component: IconExternalLink, category: 'interface', label: 'icons.externalLink' },
    filter: { component: IconFilter, category: 'interface', label: 'icons.filter' },
    filterFilled: { component: IconFilterFilled, category: 'interface', label: 'icons.filterFilled' },
    sortArrows: { component: IconArrowsSort, category: 'interface', label: 'icons.sortArrows' },
    sortAscending: { component: IconSortAscending, category: 'interface', label: 'icons.sortAscending' },
    sortDescending: { component: IconSortDescending, category: 'interface', label: 'icons.sortDescending' },
    list: { component: IconList, category: 'interface', label: 'icons.list' },
    map: { component: IconMap2, category: 'interface', label: 'icons.map' },
    comment: { component: IconMessageCircle, category: 'interface', label: 'icons.comment' },
    bold: { component: IconBold, category: 'interface', label: 'icons.bold' },
    italic: { component: IconItalic, category: 'interface', label: 'icons.italic' },
    listNumbers: { component: IconListNumbers, category: 'interface', label: 'icons.listNumbers' },
    refresh: { component: IconRefresh, category: 'interface', label: 'icons.refresh' },
    restore: { component: IconRestore, category: 'interface', label: 'icons.restore' },
    trashX: { component: IconTrashX, category: 'interface', label: 'icons.trashX' },
    default: { component: IconSettings, category: 'interface', label: 'icons.default' },
    mapPin: { component: IconMapPin, category: 'places', label: 'icons.mapPin' },
    mapPinDollar: { component: IconMapPinDollar, category: 'places', label: 'icons.mapPinDollar' },
    mailPin: { component: IconMailPin, category: 'places', label: 'icons.mailPin' },
    mailSpark: { component: IconMailSpark, category: 'places', label: 'icons.mailSpark' },
    buildingFactory: { component: IconBuildingFactory2, category: 'places', label: 'icons.buildingFactory' },
    buildingStore: { component: IconBuildingStore, category: 'places', label: 'icons.buildingStore' },
    truckDelivery: { component: IconTruckDelivery, category: 'shipping', label: 'icons.truckDelivery' },
    truckReturn: { component: IconTruckReturn, category: 'shipping', label: 'icons.truckReturn' },
    truckLoading: { component: IconTruckLoading, category: 'shipping', label: 'icons.truckLoading' },
    jetpack: { component: IconJetpack, category: 'shipping', label: 'icons.jetpack' },
    transferOut: { component: IconTransferOut, category: 'shipping', label: 'icons.transferOut' },
    shoppingCartBolt: { component: IconShoppingCartBolt, category: 'commerce', label: 'icons.shoppingCartBolt' },
    shoppingCart: { component: IconShoppingCart, category: 'commerce', label: 'icons.shoppingCart' },
    moneybagPlus: { component: IconMoneybagPlus, category: 'commerce', label: 'icons.moneybagPlus' },
    reportMoney: { component: IconReportMoney, category: 'commerce', label: 'icons.reportMoney' },
    contract: { component: IconContract, category: 'commerce', label: 'icons.contract' },
    ad: { component: IconAd2, category: 'commerce', label: 'icons.ad' },
    cloudComputing: { component: IconCloudComputing, category: 'commerce', label: 'icons.cloudComputing' },
    messageCircleUser: { component: IconMessageCircleUser, category: 'people', label: 'icons.messageCircleUser' },
    box: { component: IconBox, category: 'production', label: 'icons.box' },
    perfume: { component: IconPerfume, category: 'ingredients', label: 'icons.perfume' },
    dropletHalf: { component: IconDropletHalf2, category: 'ingredients', label: 'icons.dropletHalf' },
    radioactive: { component: IconRadioactive, category: 'ingredients', label: 'icons.radioactive' },
    salt: { component: IconSalt, category: 'ingredients', label: 'icons.salt' },
    colorSwatch: { component: IconColorSwatch, category: 'ingredients', label: 'icons.colorSwatch' },
    macro: { component: IconMacro, category: 'ingredients', label: 'icons.macro' },
    snowman: { component: IconSnowman, category: 'production', label: 'icons.snowman' },
    pepper: { component: IconPepper, category: 'ingredients', label: 'icons.pepper' },
    bucketDroplet: { component: IconBucketDroplet, category: 'production', label: 'icons.bucketDroplet' },
    shieldCheck: { component: IconShieldCheck, category: 'commerce', label: 'icons.shieldCheck' },
    tag: { component: IconTag, category: 'commerce', label: 'icons.tag' },
    flower: { component: IconFlower, category: 'ingredients', label: 'icons.flower' },
    droplet: { component: IconDroplet, category: 'ingredients', label: 'icons.droplet' },
    idBadge: { component: IconIdBadge2, category: 'people', label: 'icons.idBadge' },
    usersGroup: { component: IconUsersGroup, category: 'people', label: 'icons.usersGroup' },
    addressBook: { component: IconAddressBook, category: 'people', label: 'icons.addressBook' },
    home: { component: IconHome, category: 'places', label: 'icons.home' },
    receipt: { component: IconReceipt, category: 'commerce', label: 'icons.receipt' },
    fileInvoice: { component: IconFileInvoice, category: 'commerce', label: 'icons.fileInvoice' },
    creditCard: { component: IconCreditCard, category: 'commerce', label: 'icons.creditCard' },
    percentage: { component: IconPercentage, category: 'commerce', label: 'icons.percentage' },
    certificate: { component: IconCertificate, category: 'commerce', label: 'icons.certificate' },
    rosetteDiscountCheck: { component: IconRosetteDiscountCheck, category: 'commerce', label: 'icons.rosetteDiscountCheck' },
    packages: { component: IconPackages, category: 'shipping', label: 'icons.packages' },
    packageImport: { component: IconPackageImport, category: 'shipping', label: 'icons.packageImport' },
    packageExport: { component: IconPackageExport, category: 'shipping', label: 'icons.packageExport' },
    forklift: { component: IconForklift, category: 'shipping', label: 'icons.forklift' },
    barcode: { component: IconBarcode, category: 'shipping', label: 'icons.barcode' },
    qrcode: { component: IconQrcode, category: 'shipping', label: 'icons.qrcode' },
    scale: { component: IconScale, category: 'production', label: 'icons.scale' },
    temperature: { component: IconTemperature, category: 'production', label: 'icons.temperature' },
    flame: { component: IconFlame, category: 'production', label: 'icons.flame' },
    clock: { component: IconClockHour4, category: 'production', label: 'icons.clock' },
    clipboardCheck: { component: IconClipboardCheck, category: 'production', label: 'icons.clipboardCheck' },
    leaf: { component: IconLeaf, category: 'ingredients', label: 'icons.leaf' },
    plant: { component: IconPlant, category: 'ingredients', label: 'icons.plant' },
    plant2: { component: IconPlant2, category: 'ingredients', label: 'icons.plant2' },
    seedling: { component: IconSeedling, category: 'ingredients', label: 'icons.seedling' },
    clover: { component: IconClover, category: 'ingredients', label: 'icons.clover' },
    cactus: { component: IconCactus, category: 'ingredients', label: 'icons.cactus' },
    mushroom: { component: IconMushroom, category: 'ingredients', label: 'icons.mushroom' },
    wheat: { component: IconWheat, category: 'ingredients', label: 'icons.wheat' },
    lemon: { component: IconLemon, category: 'ingredients', label: 'icons.lemon' },
    carrot: { component: IconCarrot, category: 'ingredients', label: 'icons.carrot' },
    cherry: { component: IconCherry, category: 'ingredients', label: 'icons.cherry' },
    feather: { component: IconFeather, category: 'ingredients', label: 'icons.feather' },
    soap: { component: IconWashHand, category: 'production', label: 'icons.soap' },
    candle: { component: IconCandle, category: 'production', label: 'icons.candle' },
    bath: { component: IconBath, category: 'production', label: 'icons.bath' },
    deodorant: { component: IconSpray, category: 'production', label: 'icons.deodorant' },
    butter: { component: IconCheese, category: 'ingredients', label: 'icons.butter' },
    mountain: { component: IconMountain, category: 'ingredients', label: 'icons.mountain' },
    utensils: { component: IconBowlSpoon, category: 'production', label: 'icons.utensils' },
    target: { component: IconTarget, category: 'interface', label: 'icons.target' },
    chartLine: { component: IconChartLine, category: 'interface', label: 'icons.chartLine' },
    database: { component: IconDatabase, category: 'interface', label: 'icons.database' },
    plug: { component: IconPlug, category: 'interface', label: 'icons.plug' },
    key: { component: IconKeyGlyph, category: 'interface', label: 'icons.key' },
    calculator: { component: IconCalculator, category: 'interface', label: 'icons.calculator' },
    bulb: { component: IconBulb, category: 'interface', label: 'icons.bulb' },
    share: { component: IconShare, category: 'interface', label: 'icons.share' },
    news: { component: IconNews, category: 'interface', label: 'icons.news' },
    confetti: { component: IconConfetti, category: 'interface', label: 'icons.confetti' },
    article: { component: IconArticle, category: 'interface', label: 'icons.article' },
    tool: { component: IconTool, category: 'interface', label: 'icons.tool' },
    rss: { component: IconRss, category: 'interface', label: 'icons.rss' },
    handshake: { component: IconHeartHandshake, category: 'interface', label: 'icons.handshake' },
    briefcase: { component: IconBriefcase, category: 'interface', label: 'icons.briefcase' },
    apps: { component: IconApps, category: 'interface', label: 'icons.apps' },
    buildingPavilion: { component: IconBuildingPavilion, category: 'interface', label: 'icons.buildingPavilion' },
    calendarEvent: { component: IconCalendarEvent, category: 'interface', label: 'icons.calendarEvent' },
    microphone: { component: IconMicrophone, category: 'interface', label: 'icons.microphone' },
    speakerphone: { component: IconSpeakerphone, category: 'interface', label: 'icons.speakerphone' },
} as const satisfies Record<string, IconDefinition>;

export type IconKey = keyof typeof ICONS;

export const ICON_KEYS = Object.keys( ICONS ) as IconKey[];
