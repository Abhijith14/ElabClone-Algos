-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 11, 2020 at 10:12 PM
-- Server version: 10.4.13-MariaDB
-- PHP Version: 7.2.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `csharp`
--
CREATE DATABASE IF NOT EXISTS `csharp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `csharp`;

-- --------------------------------------------------------

--
-- Table structure for table `elabdata`
--

DROP TABLE IF EXISTS `elabdata`;
CREATE TABLE IF NOT EXISTS `elabdata` (
  `id` int(100) DEFAULT NULL,
  `SESSION` varchar(255) DEFAULT NULL,
  `QUESTION_NO` varchar(100) DEFAULT NULL,
  `QUESTION_NAME` varchar(255) DEFAULT NULL,
  `QUESTION_DESC` varchar(3000) DEFAULT NULL,
  `CODE` varchar(5000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `elabtestcase`
--

DROP TABLE IF EXISTS `elabtestcase`;
CREATE TABLE IF NOT EXISTS `elabtestcase` (
  `dataid` int(100) DEFAULT NULL,
  `TESTCASE_NO` varchar(100) DEFAULT NULL,
  `INPUT` varchar(500) DEFAULT NULL,
  `OUTPUT` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
